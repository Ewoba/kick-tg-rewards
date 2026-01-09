import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimStatus } from '@prisma/client';

const MAX_RETRIES = 3;
const PROCESS_INTERVAL_MS = 30000; // 30 seconds

@Injectable()
export class TransactionQueueService implements OnModuleInit {
    private readonly logger = new Logger(TransactionQueueService.name);
    private processing = false;
    private intervalId: NodeJS.Timeout | null = null;

    constructor(
        private cryptoService: CryptoService,
        private prisma: PrismaService,
    ) { }

    onModuleInit() {
        // Start processing queue on module init
        if (process.env.ENABLE_TX_QUEUE === 'true') {
            this.startProcessing();
        }
    }

    startProcessing() {
        if (this.intervalId) return;

        this.logger.log('Starting transaction queue processor');
        this.intervalId = setInterval(() => this.processPendingClaims(), PROCESS_INTERVAL_MS);

        // Process immediately on start
        this.processPendingClaims();
    }

    stopProcessing() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.logger.log('Stopped transaction queue processor');
        }
    }

    /**
     * Process all pending prize claims
     */
    async processPendingClaims() {
        if (this.processing) {
            this.logger.debug('Already processing, skipping...');
            return;
        }

        this.processing = true;

        try {
            // Get pending claims
            const pendingClaims = await this.prisma.prizeClaim.findMany({
                where: {
                    status: ClaimStatus.PENDING,
                    retryCount: { lt: MAX_RETRIES },
                },
                include: {
                    user: { include: { wallet: true } },
                    prize: true,
                },
                take: 10, // Process max 10 at a time
                orderBy: { claimedAt: 'asc' },
            });

            this.logger.log(`Processing ${pendingClaims.length} pending claims`);

            for (const claim of pendingClaims) {
                await this.processSingleClaim(claim);
            }

            // Also check PROCESSING claims for completion
            await this.checkProcessingClaims();
        } catch (error) {
            this.logger.error('Error processing claims:', error);
        } finally {
            this.processing = false;
        }
    }

    /**
     * Process a single claim
     */
    private async processSingleClaim(claim: any) {
        const { id, user, prize } = claim;

        // Validate user has verified wallet
        if (!user.wallet?.verified) {
            this.logger.warn(`Claim ${id}: User wallet not verified`);
            await this.updateClaimFailed(id, 'User wallet not verified');
            return;
        }

        // Validate prize has token amount
        if (!prize.tokenAmount) {
            this.logger.warn(`Claim ${id}: Prize has no token amount`);
            await this.updateClaimFailed(id, 'Prize has no token amount configured');
            return;
        }

        try {
            // Mark as processing
            await this.prisma.prizeClaim.update({
                where: { id },
                data: {
                    status: ClaimStatus.PROCESSING,
                    processedAt: new Date(),
                },
            });

            // Send tokens
            const tokenContract = process.env.TOKEN_CONTRACT_ADDRESS || undefined;
            const result = await this.cryptoService.sendToken(
                user.wallet.address,
                prize.tokenAmount,
                tokenContract,
            );

            // Update with tx hash
            await this.prisma.prizeClaim.update({
                where: { id },
                data: { txHash: result.txHash },
            });

            this.logger.log(`Claim ${id}: Transaction sent, hash: ${result.txHash}`);
        } catch (error) {
            this.logger.error(`Claim ${id}: Failed to send transaction`, error);
            await this.prisma.prizeClaim.update({
                where: { id },
                data: {
                    status: ClaimStatus.PENDING, // Reset to pending for retry
                    retryCount: { increment: 1 },
                    txError: (error as Error).message,
                },
            });
        }
    }

    /**
     * Check PROCESSING claims for transaction completion
     */
    private async checkProcessingClaims() {
        const processingClaims = await this.prisma.prizeClaim.findMany({
            where: {
                status: ClaimStatus.PROCESSING,
                txHash: { not: null },
            },
        });

        for (const claim of processingClaims) {
            if (!claim.txHash) continue;

            try {
                const txStatus = await this.cryptoService.checkTransaction(claim.txHash);

                if (txStatus.status === 'success' && txStatus.confirmations >= 1) {
                    await this.prisma.prizeClaim.update({
                        where: { id: claim.id },
                        data: {
                            status: ClaimStatus.SUCCESS,
                            completedAt: new Date(),
                        },
                    });
                    this.logger.log(`Claim ${claim.id}: Transaction confirmed`);
                } else if (txStatus.status === 'failed') {
                    await this.updateClaimFailed(claim.id, 'Transaction reverted on-chain');
                }
                // If still pending, leave as PROCESSING
            } catch (error) {
                this.logger.error(`Error checking tx ${claim.txHash}:`, error);
            }
        }
    }

    /**
     * Mark claim as failed
     */
    private async updateClaimFailed(claimId: string, error: string) {
        await this.prisma.prizeClaim.update({
            where: { id: claimId },
            data: {
                status: ClaimStatus.FAILED,
                completedAt: new Date(),
                txError: error,
            },
        });
    }

    /**
     * Manually trigger processing (for admin use)
     */
    async triggerProcessing(): Promise<{ processed: number }> {
        await this.processPendingClaims();
        const processed = await this.prisma.prizeClaim.count({
            where: { status: ClaimStatus.PROCESSING },
        });
        return { processed };
    }
}

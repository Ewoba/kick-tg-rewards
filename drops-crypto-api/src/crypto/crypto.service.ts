import { Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

// ERC20 minimal ABI for transfer
const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
];

@Injectable()
export class CryptoService {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet | null = null;

    constructor(private prisma: PrismaService) {
        // Initialize provider for Base Sepolia testnet
        const rpcUrl = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        // Initialize wallet if private key is provided
        if (process.env.WALLET_PRIVATE_KEY) {
            this.wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, this.provider);
        }
    }

    /**
     * Generate a nonce for SIWE signature verification
     */
    async generateNonce(userId: string, address: string): Promise<{ nonce: string; message: string; expiresAt: Date }> {
        const normalizedAddress = ethers.getAddress(address).toLowerCase();
        const nonce = randomUUID();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create SIWE message
        const siweMessage = new SiweMessage({
            domain: process.env.APP_DOMAIN || 'localhost',
            address: ethers.getAddress(address), // Checksum address
            statement: 'Sign in to Drops Crypto and verify wallet ownership.',
            uri: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
            version: '1',
            chainId: 84532, // Base Sepolia
            nonce,
            expirationTime: expiresAt.toISOString(),
        });

        const message = siweMessage.prepareMessage();

        // Store verification request
        await this.prisma.walletVerification.upsert({
            where: {
                userId_address: { userId, address: normalizedAddress },
            },
            update: {
                nonce,
                message,
                verified: false,
                nonceUsed: false, // Reset on new verification attempt
                expiresAt,
            },
            create: {
                userId,
                address: normalizedAddress,
                nonce,
                message,
                verified: false,
                nonceUsed: false,
                expiresAt,
            },
        });

        return { nonce, message, expiresAt };
    }

    /**
     * Verify SIWE signature and update wallet status
     */
    async verifySiweSignature(
        userId: string,
        message: string,
        signature: string,
    ): Promise<{ verified: boolean; address: string }> {
        try {
            const siweMessage = new SiweMessage(message);
            const fields = await siweMessage.verify({ signature });

            if (!fields.success) {
                throw new BadRequestException('Invalid signature');
            }

            const normalizedAddress = siweMessage.address.toLowerCase();

            // Check if verification exists
            const verification = await this.prisma.walletVerification.findUnique({
                where: {
                    userId_address: { userId, address: normalizedAddress },
                },
            });

            if (!verification) {
                throw new BadRequestException('No pending verification found');
            }

            // Check expiration
            if (verification.expiresAt < new Date()) {
                throw new BadRequestException('Verification expired');
            }

            // Check nonce match
            if (verification.nonce !== siweMessage.nonce) {
                throw new BadRequestException('Invalid nonce');
            }

            // Check if nonce already used (prevent replay)
            if (verification.nonceUsed) {
                throw new BadRequestException('Nonce already used');
            }

            // Update wallet as verified
            await this.prisma.wallet.upsert({
                where: { userId },
                update: {
                    address: normalizedAddress,
                    chain: 'base',
                    verified: true,
                    verifiedAt: new Date(),
                },
                create: {
                    userId,
                    address: normalizedAddress,
                    chain: 'base',
                    verified: true,
                    verifiedAt: new Date(),
                },
            });

            // Mark verification as complete and nonce as used
            await this.prisma.walletVerification.update({
                where: {
                    userId_address: { userId, address: normalizedAddress },
                },
                data: { 
                    verified: true,
                    nonceUsed: true, // Prevent replay
                },
            });

            return { verified: true, address: normalizedAddress };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Signature verification failed: ' + (error as Error).message);
        }
    }

    /**
     * Send ERC20 tokens to an address
     */
    async sendToken(
        toAddress: string,
        amount: string,
        tokenContractAddress?: string,
    ): Promise<{ txHash: string }> {
        if (!this.wallet) {
            throw new BadRequestException('Wallet not configured');
        }

        const to = ethers.getAddress(toAddress);

        // If no token contract, send native ETH
        if (!tokenContractAddress) {
            const tx = await this.wallet.sendTransaction({
                to,
                value: ethers.parseEther(amount),
            });
            return { txHash: tx.hash };
        }

        // Send ERC20 token
        const contract = new ethers.Contract(tokenContractAddress, ERC20_ABI, this.wallet);
        const decimals = await contract.decimals();
        const amountInWei = ethers.parseUnits(amount, decimals);

        const tx = await contract.transfer(to, amountInWei);
        return { txHash: tx.hash };
    }

    /**
     * Check transaction status
     */
    async checkTransaction(txHash: string): Promise<{
        status: 'pending' | 'success' | 'failed';
        confirmations: number;
    }> {
        const receipt = await this.provider.getTransactionReceipt(txHash);

        if (!receipt) {
            return { status: 'pending', confirmations: 0 };
        }

        const currentBlock = await this.provider.getBlockNumber();
        const confirmations = currentBlock - receipt.blockNumber + 1;

        if (receipt.status === 1) {
            return { status: 'success', confirmations };
        } else {
            return { status: 'failed', confirmations };
        }
    }

    /**
     * Get wallet balance
     */
    async getBalance(address: string, tokenContractAddress?: string): Promise<string> {
        if (!tokenContractAddress) {
            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        }

        const contract = new ethers.Contract(tokenContractAddress, ERC20_ABI, this.provider);
        const balance = await contract.balanceOf(address);
        const decimals = await contract.decimals();
        return ethers.formatUnits(balance, decimals);
    }

    /**
     * Get hot wallet address (for deposits)
     */
    getHotWalletAddress(): string | null {
        return this.wallet?.address || null;
    }
}

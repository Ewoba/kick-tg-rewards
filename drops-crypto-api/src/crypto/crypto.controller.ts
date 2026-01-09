import { Controller, Post, Get, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JwtGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('me/wallet')
@UseGuards(JwtGuard)
export class CryptoController {
    constructor(
        private cryptoService: CryptoService,
        private prisma: PrismaService,
    ) { }

    /**
     * Get nonce for SIWE signature
     */
    @Post('nonce')
    async getNonce(@Req() req: any, @Body() body: { address: string }) {
        const userId = req.user.sub as string;
        const address = (body.address || '').trim();

        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            throw new BadRequestException('Invalid EVM address');
        }

        const result = await this.cryptoService.generateNonce(userId, address);

        return {
            success: true,
            nonce: result.nonce,
            message: result.message,
            expiresAt: result.expiresAt,
        };
    }

    /**
     * Verify SIWE signature and link wallet
     */
    @Post('verify')
    async verifySignature(
        @Req() req: any,
        @Body() body: { message: string; signature: string },
    ) {
        const userId = req.user.sub as string;

        if (!body.message || !body.signature) {
            throw new BadRequestException('Message and signature are required');
        }

        const result = await this.cryptoService.verifySiweSignature(
            userId,
            body.message,
            body.signature,
        );

        return {
            success: true,
            verified: result.verified,
            address: result.address,
            message: 'Wallet verified successfully',
        };
    }

    /**
     * Get wallet verification status
     */
    @Get('status')
    async getWalletStatus(@Req() req: any) {
        const userId = req.user.sub as string;

        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });

        return {
            hasWallet: !!wallet,
            address: wallet?.address || null,
            chain: wallet?.chain || null,
            verified: wallet?.verified || false,
            verifiedAt: wallet?.verifiedAt || null,
        };
    }
}

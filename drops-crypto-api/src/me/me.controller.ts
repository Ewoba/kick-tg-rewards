import { Body, Controller, Get, Post, Req, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ClaimStatus } from '@prisma/client';

@Controller()
export class MeController {
  constructor(private prisma: PrismaService) { }

  @UseGuards(JwtGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user.sub as string;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        _count: {
          select: {
            follows: true,
            prizeClaims: true,
          },
        },
      },
    });

    return {
      id: user!.id,
      twitchLogin: user!.twitchLogin,
      wallet: user!.wallet ? {
        chain: user!.wallet.chain,
        address: user!.wallet.address,
        verified: user!.wallet.verified,
        verifiedAt: user!.wallet.verifiedAt,
      } : null,
      participationActive: Boolean(user!.wallet?.verified),
      stats: {
        followingCount: user!._count.follows,
        claimsCount: user!._count.prizeClaims,
      },
    };
  }

  @UseGuards(JwtGuard)
  @Post('me/wallet')
  async addWallet(@Req() req: any, @Body() body: { address: string }) {
    const address = (body.address || '').trim().toLowerCase();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new BadRequestException('Invalid EVM address');
    }

    const userId = req.user.sub as string;

    await this.prisma.wallet.upsert({
      where: { userId },
      update: { address, chain: 'base', verified: false, verifiedAt: null },
      create: { userId, address, chain: 'base' },
    });

    return { ok: true, message: 'Wallet added. Please verify ownership.' };
  }

  @UseGuards(JwtGuard)
  @Get('me/prizes')
  async getMyPrizes(
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    const userId = req.user.sub as string;

    // Build filter
    const where: any = { userId };
    if (status && Object.values(ClaimStatus).includes(status.toUpperCase() as ClaimStatus)) {
      where.status = status.toUpperCase() as ClaimStatus;
    }

    const claims = await this.prisma.prizeClaim.findMany({
      where,
      include: {
        prize: {
          include: {
            streamer: {
              select: {
                displayName: true,
                twitchLogin: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { claimedAt: 'desc' },
    });

    return claims.map((claim) => ({
      id: claim.id,
      status: claim.status,
      claimedAt: claim.claimedAt,
      completedAt: claim.completedAt,
      txHash: claim.txHash,
      txError: claim.txError,
      prize: {
        id: claim.prize.id,
        title: claim.prize.title,
        description: claim.prize.description,
        imageUrl: claim.prize.imageUrl,
        tokenAmount: claim.prize.tokenAmount,
        tokenSymbol: claim.prize.tokenSymbol,
        chain: claim.prize.chain,
        streamer: claim.prize.streamer,
      },
    }));
  }

  @UseGuards(JwtGuard)
  @Get('me/claims')
  async getMyClaims(
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    // Alias for /me/prizes
    return this.getMyPrizes(req, status);
  }
}

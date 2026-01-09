import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createStreamer(data: {
    twitchId: string;
    twitchLogin: string;
    displayName: string;
    avatarUrl?: string;
  }) {
    const streamer = await this.prisma.streamer.upsert({
      where: { twitchId: data.twitchId },
      update: {
        twitchLogin: data.twitchLogin,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        isActive: true,
      },
      create: {
        twitchId: data.twitchId,
        twitchLogin: data.twitchLogin,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        isActive: true,
      },
    });

    return {
      success: true,
      streamer,
    };
  }

  async createPrize(
    streamerId: string,
    data: {
      title: string;
      description?: string;
      imageUrl?: string;
      tokenAmount?: string;
      tokenSymbol?: string;
      chain?: string;
    }
  ) {
    // Check if streamer exists
    const streamer = await this.prisma.streamer.findUnique({
      where: { id: streamerId },
    });

    if (!streamer) {
      throw new NotFoundException('Streamer not found');
    }

    const prize = await this.prisma.prize.create({
      data: {
        streamerId,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        tokenAmount: data.tokenAmount,
        tokenSymbol: data.tokenSymbol || 'USDC',
        chain: data.chain || 'base',
        isActive: true,
      },
      include: {
        streamer: {
          select: {
            displayName: true,
            twitchLogin: true,
          },
        },
      },
    });

    return {
      success: true,
      prize,
    };
  }

  async updatePrizeStatus(prizeId: string, isActive: boolean) {
    const prize = await this.prisma.prize.findUnique({
      where: { id: prizeId },
    });

    if (!prize) {
      throw new NotFoundException('Prize not found');
    }

    const updated = await this.prisma.prize.update({
      where: { id: prizeId },
      data: { isActive },
    });

    return {
      success: true,
      prize: updated,
    };
  }

  async getAllClaims() {
    const claims = await this.prisma.prizeClaim.findMany({
      include: {
        prize: {
          include: {
            streamer: {
              select: {
                displayName: true,
                twitchLogin: true,
              },
            },
          },
        },
        user: {
          select: {
            twitchLogin: true,
            wallet: true,
          },
        },
      },
      orderBy: { claimedAt: 'desc' },
    });

    return claims;
  }

  async updateClaimStatus(
    claimId: string,
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED',
    txHash?: string | null,
    error?: string | null
  ) {
    const claim = await this.prisma.prizeClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    const updateData: any = {
      status,
    };

    if (status === 'PROCESSING') {
      updateData.processedAt = new Date();
    }

    if (status === 'SUCCESS') {
      updateData.completedAt = new Date();
      if (txHash) {
        updateData.txHash = txHash;
      }
    }

    if (status === 'FAILED') {
      updateData.completedAt = new Date();
      if (error) {
        updateData.txError = error;
      }
    }

    const updated = await this.prisma.prizeClaim.update({
      where: { id: claimId },
      data: updateData,
      include: {
        prize: {
          include: {
            streamer: {
              select: {
                displayName: true,
                twitchLogin: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      claim: updated,
    };
  }
}

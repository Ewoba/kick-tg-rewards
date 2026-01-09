import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrizesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.prize.findMany({
      where: { isActive: true },
      include: {
        streamer: {
          select: {
            displayName: true,
            twitchLogin: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const prize = await this.prisma.prize.findUnique({
      where: { id },
      include: {
        streamer: {
          select: {
            displayName: true,
            twitchLogin: true,
          },
        },
      },
    });

    if (!prize) {
      throw new NotFoundException('Prize not found');
    }

    return prize;
  }

  async claim(prizeId: string, userId: string) {
    // Check if prize exists and is active
    const prize = await this.prisma.prize.findUnique({
      where: { id: prizeId },
    });

    if (!prize) {
      throw new NotFoundException('Prize not found');
    }

    if (!prize.isActive) {
      throw new BadRequestException('Prize is not active');
    }

    // Check if user already claimed this prize
    const existingClaim = await this.prisma.prizeClaim.findUnique({
      where: {
        userId_prizeId: {
          userId,
          prizeId,
        },
      },
    });

    if (existingClaim) {
      throw new BadRequestException('Prize already claimed');
    }

    // Check if user has wallet
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user?.wallet) {
      throw new BadRequestException('Wallet required to claim prize');
    }

    // Create claim with PENDING status
    const claim = await this.prisma.prizeClaim.create({
      data: {
        userId,
        prizeId,
        status: 'PENDING',
      },
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

    // TODO: Queue transaction for processing
    // In production, this would trigger a background job

    return {
      success: true,
      claim,
      message: 'Prize claimed successfully. Processing will start shortly.',
    };
  }

  async getUserClaims(userId: string, status?: string) {
    const where: any = { userId };
    if (status && ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'].includes(status)) {
      where.status = status;
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
              },
            },
          },
        },
      },
      orderBy: { claimedAt: 'desc' },
    });

    return claims;
  }
}

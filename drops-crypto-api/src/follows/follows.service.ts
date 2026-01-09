import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async getUserFollows(userId: string) {
    const follows = await this.prisma.userFollow.findMany({
      where: { userId },
      include: {
        streamer: {
          include: {
            _count: {
              select: { prizes: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return follows.map((follow) => ({
      id: follow.id,
      streamer: follow.streamer,
      followedAt: follow.createdAt,
    }));
  }

  async follow(userId: string, streamerId: string) {
    // Check if streamer exists
    const streamer = await this.prisma.streamer.findUnique({
      where: { id: streamerId },
    });

    if (!streamer) {
      throw new NotFoundException('Streamer not found');
    }

    // Check if already following
    const existing = await this.prisma.userFollow.findUnique({
      where: {
        userId_streamerId: {
          userId,
          streamerId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Already following this streamer');
    }

    const follow = await this.prisma.userFollow.create({
      data: {
        userId,
        streamerId,
      },
      include: {
        streamer: true,
      },
    });

    return {
      success: true,
      follow,
      message: 'Streamer followed successfully',
    };
  }

  async unfollow(userId: string, streamerId: string) {
    const follow = await this.prisma.userFollow.findUnique({
      where: {
        userId_streamerId: {
          userId,
          streamerId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Not following this streamer');
    }

    await this.prisma.userFollow.delete({
      where: {
        userId_streamerId: {
          userId,
          streamerId,
        },
      },
    });

    return {
      success: true,
      message: 'Unfollowed successfully',
    };
  }

  async isFollowing(userId: string, streamerId: string): Promise<boolean> {
    const follow = await this.prisma.userFollow.findUnique({
      where: {
        userId_streamerId: {
          userId,
          streamerId,
        },
      },
    });

    return !!follow;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StreamersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    const streamers = await this.prisma.streamer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { prizes: true, followers: true },
        },
      },
    });

    // Add isFollowing flag if userId provided
    if (userId) {
      const userFollows = await this.prisma.userFollow.findMany({
        where: { userId },
        select: { streamerId: true },
      });
      const followedStreamerIds = new Set(userFollows.map((f) => f.streamerId));

      return streamers.map((streamer) => ({
        ...streamer,
        isFollowing: followedStreamerIds.has(streamer.id),
      }));
    }

    return streamers.map((streamer) => ({
      ...streamer,
      isFollowing: false,
    }));
  }

  async findOne(id: string, userId?: string) {
    const streamer = await this.prisma.streamer.findUnique({
      where: { id },
      include: {
        prizes: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { followers: true },
        },
      },
    });

    if (!streamer) {
      throw new NotFoundException('Streamer not found');
    }

    // Add isFollowing flag if userId provided
    if (userId) {
      const follow = await this.prisma.userFollow.findUnique({
        where: {
          userId_streamerId: {
            userId,
            streamerId: id,
          },
        },
      });
      return {
        ...streamer,
        isFollowing: !!follow,
      };
    }

    return {
      ...streamer,
      isFollowing: false,
    };
  }
}

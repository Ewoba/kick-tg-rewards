import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('me/streamers')
@UseGuards(JwtGuard)
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Get()
  async getMyStreamers(@Req() req: any) {
    const userId = req.user.sub as string;
    return this.followsService.getUserFollows(userId);
  }

  @Post(':streamerId/follow')
  async follow(@Param('streamerId') streamerId: string, @Req() req: any) {
    const userId = req.user.sub as string;
    return this.followsService.follow(userId, streamerId);
  }

  @Delete(':streamerId/follow')
  async unfollow(@Param('streamerId') streamerId: string, @Req() req: any) {
    const userId = req.user.sub as string;
    return this.followsService.unfollow(userId, streamerId);
  }
}

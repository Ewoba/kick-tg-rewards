import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get admin allowlist from env
    const adminIds = process.env.ADMIN_TWITCH_IDS?.split(',').map(id => id.trim()) || [];
    
    // Check if user's Twitch ID is in allowlist
    const twitchUserId = user.twitchUserId || user.twitchId;
    
    if (!twitchUserId) {
      throw new ForbiddenException('Twitch user ID not found in token');
    }

    if (!adminIds.includes(twitchUserId)) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    return true;
  }
}

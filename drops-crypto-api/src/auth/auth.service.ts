import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async storeState(state: string, expiresIn: number = 600): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    await this.prisma.oAuthState.create({
      data: {
        state,
        expiresAt,
        used: false,
      },
    });
  }

  async validateState(state: string): Promise<boolean> {
    // Validate state format (32 bytes hex = 64 chars)
    if (!/^[a-f0-9]{64}$/i.test(state)) {
      return false;
    }

    // Check if state exists in database
    const stateRecord = await this.prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!stateRecord) {
      return false;
    }

    // Check if already used
    if (stateRecord.used) {
      return false;
    }

    // Check if expired
    if (stateRecord.expiresAt < new Date()) {
      return false;
    }

    // Mark as used
    await this.prisma.oAuthState.update({
      where: { state },
      data: { used: true },
    });

    return true;
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ token: string; user: any }> {
    // State should already be validated in controller, but double-check
    if (!state || !(await this.validateState(state))) {
      throw new Error('Invalid or expired OAuth state');
    }

    // 1) Exchange code for access_token
    let tokenResp;
    try {
      tokenResp = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        new URLSearchParams({
          client_id: process.env.TWITCH_CLIENT_ID!,
          client_secret: process.env.TWITCH_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.TWITCH_REDIRECT_URI!,
        }),
      );
    } catch (err: any) {
      // Log detailed error (safe to log response status/body in dev) and rethrow a helpful message
      console.error('[OAuth Token Error] token exchange failed', err.response ? { status: err.response.status, data: err.response.data } : err.message);
      throw new Error(`Token exchange failed: ${err.response?.data?.message || err.message}`);
    }

    const { access_token } = tokenResp.data;

    // 2) Get user profile
    let userResp;
    try {
      userResp = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    } catch (err: any) {
      console.error('[OAuth User Error] failed to fetch user profile', err.response ? { status: err.response.status, data: err.response.data } : err.message);
      throw new Error(`Failed to fetch Twitch user profile: ${err.message}`);
    }

    const twitchUser = userResp.data.data[0];

    // 3) Upsert user in database
    const user = await this.prisma.user.upsert({
      where: { twitchUserId: twitchUser.id },
      update: {
        twitchLogin: twitchUser.login,
      },
      create: {
        twitchUserId: twitchUser.id,
        twitchLogin: twitchUser.login,
      },
    });

    // 4) Generate JWT (include twitchUserId for AdminGuard)
    const token = jwt.sign(
      {
        sub: user.id,
        twitchUserId: user.twitchUserId,
        twitchLogin: user.twitchLogin,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '30d',
      },
    );

    return { token, user };
  }
}

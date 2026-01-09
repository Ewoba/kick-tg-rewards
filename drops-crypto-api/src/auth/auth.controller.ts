import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

@Controller('auth/twitch')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  @Get('start')
  async start(@Res() res: Response) {
    const clientId = process.env.TWITCH_CLIENT_ID!;
    const redirectUri = process.env.TWITCH_REDIRECT_URI!;
    const scope = encodeURIComponent('user:read:email');
    
    // Validate required env vars
    if (!clientId || clientId.includes('your_') || clientId.includes('placeholder')) {
      return res.status(500).json({
        error: 'TWITCH_CLIENT_ID not configured',
        message: 'Please set TWITCH_CLIENT_ID in .env file with a valid Twitch Client ID',
      });
    }

    if (!redirectUri) {
      return res.status(500).json({
        error: 'TWITCH_REDIRECT_URI not configured',
        message: 'Please set TWITCH_REDIRECT_URI in .env file',
      });
    }

    // Log for debugging (remove in production)
    console.log('[OAuth Start] Client ID:', clientId.substring(0, 10) + '...');
    console.log('[OAuth Start] Redirect URI:', redirectUri);
    
    // Generate and store state
    const state = this.authService.generateState();
    await this.authService.storeState(state, 600); // 10 minutes TTL

    const url =
      `https://id.twitch.tv/oauth2/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scope}` +
      `&state=${encodeURIComponent(state)}`;

    return res.redirect(url);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!code) return res.status(400).send('Missing code');
    
    // Validate state
    if (!state || !(await this.authService.validateState(state))) {
      return res.status(400).send('Invalid or expired OAuth state');
    }

    try {
      // Exchange code for token and create user
      const { token } = await this.authService.exchangeCodeForToken(code, state);

      // Redirect to app with token
      const scheme = process.env.APP_DEEPLINK_SCHEME || 'dropscrypto';
      const deepLink = `${scheme}://auth?token=${encodeURIComponent(token)}`;

      return res.redirect(deepLink);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return res.status(500).send(`Authentication failed: ${error.message}`);
    }
  }
}

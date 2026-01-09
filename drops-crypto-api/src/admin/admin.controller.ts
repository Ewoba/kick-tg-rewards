import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('streamers')
  async createStreamer(@Body() body: {
    twitchId: string;
    twitchLogin: string;
    displayName: string;
    avatarUrl?: string;
  }) {
    return this.adminService.createStreamer(body);
  }

  @Post('streamers/:streamerId/prizes')
  async createPrize(
    @Param('streamerId') streamerId: string,
    @Body() body: {
      title: string;
      description?: string;
      imageUrl?: string;
      tokenAmount?: string;
      tokenSymbol?: string;
      chain?: string;
    }
  ) {
    return this.adminService.createPrize(streamerId, body);
  }

  @Put('prizes/:prizeId/activate')
  async activatePrize(@Param('prizeId') prizeId: string) {
    return this.adminService.updatePrizeStatus(prizeId, true);
  }

  @Put('prizes/:prizeId/deactivate')
  async deactivatePrize(@Param('prizeId') prizeId: string) {
    return this.adminService.updatePrizeStatus(prizeId, false);
  }

  @Get('claims')
  async getAllClaims() {
    return this.adminService.getAllClaims();
  }

  @Put('claims/:claimId/mark-success')
  async markClaimSuccess(@Param('claimId') claimId: string, @Body() body: { txHash?: string }) {
    return this.adminService.updateClaimStatus(claimId, 'SUCCESS', body.txHash);
  }

  @Put('claims/:claimId/mark-failed')
  async markClaimFailed(@Param('claimId') claimId: string, @Body() body: { error?: string }) {
    return this.adminService.updateClaimStatus(claimId, 'FAILED', null, body.error);
  }

  @Put('claims/:claimId/mark-processing')
  async markClaimProcessing(@Param('claimId') claimId: string) {
    return this.adminService.updateClaimStatus(claimId, 'PROCESSING');
  }
}

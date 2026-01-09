import { Controller, Get, Post, Param, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('prizes')
export class PrizesController {
  constructor(private prizesService: PrizesService) {}

  @Get()
  async findAll() {
    return this.prizesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prizesService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/claim')
  async claim(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub as string;
    return this.prizesService.claim(id, userId);
  }

  @UseGuards(JwtGuard)
  @Get('my/claims')
  async getMyClaims(@Req() req: any, @Query('status') status?: string) {
    const userId = req.user.sub as string;
    return this.prizesService.getUserClaims(userId, status);
  }
}

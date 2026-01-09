import { Controller, Get, Param, Req, Optional } from '@nestjs/common';
import { StreamersService } from './streamers.service';

@Controller('streamers')
export class StreamersController {
  constructor(private streamersService: StreamersService) {}

  @Get()
  async findAll(@Req() req?: any) {
    const userId = req?.user?.sub;
    return this.streamersService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req?: any) {
    const userId = req?.user?.sub;
    return this.streamersService.findOne(id, userId);
  }
}

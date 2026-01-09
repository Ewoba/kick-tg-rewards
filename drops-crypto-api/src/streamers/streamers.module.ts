import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StreamersController } from './streamers.controller';
import { StreamersService } from './streamers.service';

@Module({
  imports: [PrismaModule],
  controllers: [StreamersController],
  providers: [StreamersService],
})
export class StreamersModule {}

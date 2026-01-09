import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrizesController } from './prizes.controller';
import { PrizesService } from './prizes.service';

@Module({
  imports: [PrismaModule],
  controllers: [PrizesController],
  providers: [PrizesService],
})
export class PrizesModule {}

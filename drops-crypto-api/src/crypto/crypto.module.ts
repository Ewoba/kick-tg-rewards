import { Module } from '@nestjs/common';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { TransactionQueueService } from './transaction-queue.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CryptoController],
    providers: [CryptoService, TransactionQueueService],
    exports: [CryptoService, TransactionQueueService],
})
export class CryptoModule { }


import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StreamersModule } from './streamers/streamers.module';
import { PrizesModule } from './prizes/prizes.module';
import { FollowsModule } from './follows/follows.module';
import { AdminModule } from './admin/admin.module';
import { CryptoModule } from './crypto/crypto.module';
import { HealthController } from './health.controller';
import { MeController } from './me/me.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StreamersModule,
    PrizesModule,
    FollowsModule,
    AdminModule,
    CryptoModule,
  ],
  controllers: [HealthController, MeController],
})
export class AppModule { }


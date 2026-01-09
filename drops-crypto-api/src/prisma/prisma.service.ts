import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger('PrismaService');

  async onModuleInit() {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB connection timeout')), 5000)
      );
      await Promise.race([this.$connect(), timeoutPromise]);
      this.logger.log('Database connected');
    } catch (error) {
      this.logger.warn(`Failed to connect to DB: ${error.message}. Server will continue.`);
      // Allow server to start even if DB is not available for development
    }
  }
}

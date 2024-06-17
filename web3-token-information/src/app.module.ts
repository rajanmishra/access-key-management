import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './token/token.module';
import { RateLimiterModule } from './rate-limiter/rate-limiter.module';
import { RateLimiterService } from './rate-limiter/rate-limiter.service';

@Module({
  imports: [ConfigModule.forRoot(), TokenModule, RateLimiterModule],
  controllers: [],
  providers: [RateLimiterService],
})
export class AppModule {}

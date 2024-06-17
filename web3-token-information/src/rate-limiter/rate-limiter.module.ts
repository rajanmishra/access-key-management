import { Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { RateLimiterSubscriptionService } from './rate-limiter-subscription.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  providers: [
    RateLimiterService,
    RateLimiterSubscriptionService,
    ConfigService,
  ],
  exports: [RateLimiterService],
})
export class RateLimiterModule {}

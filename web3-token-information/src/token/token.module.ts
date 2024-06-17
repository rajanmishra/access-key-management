import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { RateLimiterModule } from '../rate-limiter/rate-limiter.module';

@Module({
  imports: [RateLimiterModule],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}

// src/token/token.controller.ts
import { Controller, Get, Headers } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RateLimiterService } from '../rate-limiter/rate-limiter.service';
import { TokenService } from './token.service';
import { response } from '../common/response/apiResponse';
import { TokenResponseDto } from './dtos/token-response.dto';

@ApiTags('Token')
@Controller('v1/api/token')
export class TokenController {
  private readonly logger = new Logger(TokenService.name);
  constructor(
    private readonly rateLimiterService: RateLimiterService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Token details retrieved successfully',
    type: TokenResponseDto,
  })
  @Get('info')
  async getTokenInfo(@Headers('accesskey') accessKey: string) {
    /* The validation can be done Guard middle in case of many API,
     to demonstrate the idea we are using as service call.*/
    await this.rateLimiterService.validateAndCheckRateLimit(accessKey);
    const tokenInfo = await this.tokenService.getTokenInfo();
    this.logger.log(
      JSON.stringify({
        message: `Token information retrieved: ${JSON.stringify(tokenInfo)}`,
        status: 'success',
        key: accessKey,
      }),
    );
    return new response('Token details retrieved successfully', tokenInfo, 200);
  }
}

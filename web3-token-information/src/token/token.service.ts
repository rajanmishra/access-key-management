import { Injectable } from '@nestjs/common';
import { TokenResponseDto } from './dtos/token-response.dto';

@Injectable()
export class TokenService {
  getTokenInfo(): TokenResponseDto {
    const tokenInfo: TokenResponseDto = {
      name: 'Mock Token',
      symbol: 'MCK',
      price_usd: 100,
      market_cap_usd: 1000000,
    };

    return tokenInfo;
  }
}

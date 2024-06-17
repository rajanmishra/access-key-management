import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { TokenResponseDto } from './dtos/token-response.dto';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenService],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokenInfo', () => {
    it('should return token information', () => {
      const tokenInfo: TokenResponseDto = service.getTokenInfo();
      expect(tokenInfo).toEqual({
        name: 'Mock Token',
        symbol: 'MCK',
        price_usd: 100,
        market_cap_usd: 1000000,
      });
    });
  });
});

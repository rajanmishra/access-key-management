import { Test, TestingModule } from '@nestjs/testing';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { RateLimiterService } from '../rate-limiter/rate-limiter.service';
import { Logger } from '@nestjs/common';
import { TokenResponseDto } from './dtos/token-response.dto';
import { response } from '../common/response/apiResponse';

describe('TokenController', () => {
  let controller: TokenController;
  let tokenService: TokenService;
  let rateLimiterService: RateLimiterService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        {
          provide: TokenService,
          useValue: {
            getTokenInfo: jest.fn().mockResolvedValue({
              name: 'Mock Token',
              symbol: 'MCK',
              price_usd: 100,
              market_cap_usd: 1000000,
            }),
          },
        },
        {
          provide: RateLimiterService,
          useValue: {
            validateAndCheckRateLimit: jest.fn().mockResolvedValue(undefined),
          },
        },
        Logger,
      ],
    }).compile();

    controller = module.get<TokenController>(TokenController);
    tokenService = module.get<TokenService>(TokenService);
    rateLimiterService = module.get<RateLimiterService>(RateLimiterService);
    loggerSpy = jest.spyOn(Logger.prototype, 'log');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTokenInfo', () => {
    it('should return token information', async () => {
      const tokenInfo: TokenResponseDto = {
        name: 'Mock Token',
        symbol: 'MCK',
        price_usd: 100,
        market_cap_usd: 1000000,
      };

      const result = await controller.getTokenInfo('test-access-key');

      expect(result).toEqual(
        new response('Token details retrieved successfully', tokenInfo, 200),
      );
      expect(rateLimiterService.validateAndCheckRateLimit).toHaveBeenCalledWith(
        'test-access-key',
      );
      expect(tokenService.getTokenInfo).toHaveBeenCalled();
    });

    it('should log token information retrieval', async () => {
      const tokenInfo: TokenResponseDto = {
        name: 'Mock Token',
        symbol: 'MCK',
        price_usd: 100,
        market_cap_usd: 1000000,
      };

      await controller.getTokenInfo('test-access-key');

      expect(loggerSpy).toHaveBeenCalledWith(
        `Token information retrieved: ${JSON.stringify(tokenInfo)}`,
        JSON.stringify({
          status: 'success',
          key: 'test-access-key',
        }),
      );
    });
  });
});

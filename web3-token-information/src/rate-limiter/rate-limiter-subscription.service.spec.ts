import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RateLimiterSubscriptionService } from './rate-limiter-subscription.service';
import { RateLimiterService } from './rate-limiter.service';
import { createRedisClients } from '../config/redis.config';

jest.mock('../config/redis.config', () => ({
  createRedisClients: jest.fn(),
}));

const mockRedisClient = {
  subscribe: jest.fn(),
  on: jest.fn(),
};

describe('RateLimiterSubscriptionService', () => {
  let service: RateLimiterSubscriptionService;
  let rateLimiterService: RateLimiterService;
  let configService: ConfigService;

  beforeEach(async () => {
    (createRedisClients as jest.Mock).mockReturnValue({
      subscriberClient: mockRedisClient,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterSubscriptionService,
        {
          provide: RateLimiterService,
          useValue: {
            setAccessKeyData: jest.fn(),
            delAccessKeyData: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'CHANNEL_NAME') {
                return 'test-channel';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RateLimiterSubscriptionService>(
      RateLimiterSubscriptionService,
    );
    rateLimiterService = module.get<RateLimiterService>(RateLimiterService);
    configService = module.get<ConfigService>(ConfigService);

    // Reinitialize the service to use the mocked Redis client
    service = new RateLimiterSubscriptionService(
      rateLimiterService,
      configService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subscribe to the channel and handle messages', async () => {
    const mockSetAccessKeyData = jest
      .spyOn(rateLimiterService, 'setAccessKeyData')
      .mockResolvedValue();
    const mockDelAccessKeyData = jest
      .spyOn(rateLimiterService, 'delAccessKeyData')
      .mockResolvedValue();

    // Initialize the service
    service.onModuleInit();

    // Simulate the subscription
    const subscribeCallback = mockRedisClient.subscribe.mock.calls[0][1];
    subscribeCallback(null, 1); // No error, subscribed to 1 channel

    expect(mockRedisClient.subscribe).toHaveBeenCalledWith(
      'test-channel',
      expect.any(Function),
    );

    // Simulate receiving a message
    const messageHandler = mockRedisClient.on.mock.calls.find(
      (call) => call[0] === 'message',
    )[1];
    await messageHandler(
      'test-channel',
      JSON.stringify({ action: 'create', data: { accessKey: 'test-key' } }),
    );

    expect(mockSetAccessKeyData).toHaveBeenCalledWith('test-key', {
      accessKey: 'test-key',
    });

    // Simulate receiving a delete message
    await messageHandler(
      'test-channel',
      JSON.stringify({ action: 'delete', data: { accessKey: 'test-key' } }),
    );

    expect(mockDelAccessKeyData).toHaveBeenCalledWith('test-key');
  });
});

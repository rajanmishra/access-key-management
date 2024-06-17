import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RateLimiterService } from './rate-limiter.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RateLimitUnit } from '../schemas/rate-limit-unit.enum';
import { createRedisClients } from '../config/redis.config';
import Redis from 'ioredis';

jest.mock('../config/redis.config', () => ({
  createRedisClients: jest.fn().mockReturnValue({
    redisClient: jest.fn(),
  }),
}));

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  let redisClient: jest.Mocked<Redis>;
  let mockCreateRedisClients: jest.MockedFunction<typeof createRedisClients>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimiterService, ConfigService],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
    mockCreateRedisClients = createRedisClients as jest.MockedFunction<
      typeof createRedisClients
    >;

    redisClient = {
      hgetall: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
      set: jest.fn(),
      hmset: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    mockCreateRedisClients.mockReturnValue({
      subscriberClient: redisClient,
      redisClient: redisClient,
    });

    service['redisClient'] = redisClient; // Assign the mocked client to the service
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setAccessKeyData', () => {
    it('should throw BadRequestException if setting access key data fails', async () => {
      redisClient.hmset.mockRejectedValue(new Error('NOT_OK'));
      await expect(service.setAccessKeyData('test-key', {})).rejects.toThrow(
        new Error('NOT_OK'),
      );
    });

    it('should successfully set access key data', async () => {
      redisClient.hmset.mockResolvedValue('OK');
      await expect(
        service.setAccessKeyData('test-key', {}),
      ).resolves.not.toThrow();
    });
  });

  describe('delAccessKeyData', () => {
    it('should throw BadRequestException if deleting access key data fails', async () => {
      redisClient.del.mockResolvedValue(0);
      await expect(service.delAccessKeyData('test-key')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully delete access key data', async () => {
      redisClient.del.mockResolvedValue(1);
      await expect(service.delAccessKeyData('test-key')).resolves.not.toThrow();
    });
  });

  describe('getTTL', () => {
    it('should return correct TTL for each RateLimitUnit', () => {
      expect(service['getTTL'](RateLimitUnit.Second)).toBe(1);
      expect(service['getTTL'](RateLimitUnit.Minute)).toBe(60);
      expect(service['getTTL'](RateLimitUnit.Hour)).toBe(3600);
      expect(service['getTTL'](RateLimitUnit.Day)).toBe(86400);
    });

    it('should throw BadRequestException for invalid RateLimitUnit', () => {
      expect(() => service['getTTL']('Invalid' as RateLimitUnit)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAccessKeyDetails', () => {
    it('should throw NotFoundException if access key not found', async () => {
      redisClient.hgetall.mockResolvedValue({});
      await expect(service.getAccessKeyDetails('test-key')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return access key details if found', async () => {
      const keyDetails = { rateLimit: '10', isActive: 'true' };
      redisClient.hgetall.mockResolvedValue(keyDetails);
      await expect(service.getAccessKeyDetails('test-key')).resolves.toEqual(
        keyDetails,
      );
    });
  });

  describe('isAccessKeyActive', () => {
    it('should throw NotFoundException if access key is inactive', () => {
      const keyDetails = { isActive: false } as any;
      expect(() => service['isAccessKeyActive'](keyDetails)).toThrow(
        NotFoundException,
      );
    });

    it('should return true if access key is active', () => {
      const keyDetails = { isActive: true } as any;
      expect(service['isAccessKeyActive'](keyDetails)).toBe(true);
    });
  });

  describe('validateExpirationTime', () => {
    it('should throw NotFoundException if access key is expired', () => {
      const keyDetails = {
        expirationTime: new Date(Date.now() - 10000).toISOString(),
      } as any;
      expect(() => service['validateExpirationTime'](keyDetails)).toThrow(
        NotFoundException,
      );
    });

    it('should return true if access key is not expired', () => {
      const keyDetails = {
        expirationTime: new Date(Date.now() + 10000).toISOString(),
      } as any;
      expect(service['validateExpirationTime'](keyDetails)).toBe(true);
    });
  });

  describe('isAccesskeyExist', () => {
    it('should throw BadRequestException if access key is missing', () => {
      expect(() => service['isAccesskeyExist']('')).toThrow(
        BadRequestException,
      );
    });

    it('should return true if access key exists', () => {
      expect(service['isAccesskeyExist']('test-key')).toBe(true);
    });
  });

  describe('getWindow', () => {
    it('should return correct window string for each rate limit unit', () => {
      const now = new Date();
      expect(service['getWindow']('second')).toBe(
        `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}${now.getUTCHours()}${now.getUTCMinutes()}${now.getUTCSeconds()}`,
      );
      expect(service['getWindow']('minute')).toBe(
        `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}${now.getUTCHours()}${now.getUTCMinutes()}`,
      );
      expect(service['getWindow']('hour')).toBe(
        `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}${now.getUTCHours()}`,
      );
      expect(service['getWindow']('day')).toBe(
        `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}`,
      );
    });

    it('should throw BadRequestException for invalid rate limit unit', () => {
      expect(() => service['getWindow']('invalid')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateAndCheckRateLimit', () => {
    it('should throw BadRequestException if accessKey is missing', async () => {
      await expect(service.validateAndCheckRateLimit('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ServiceUnavailableException if lock cannot be acquired', async () => {
      redisClient.set.mockResolvedValue(null);
      await expect(
        service.validateAndCheckRateLimit('test-key'),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('should throw NotFoundException if access key is not found', async () => {
      redisClient.set.mockResolvedValue('OK');
      redisClient.hgetall.mockResolvedValue({});
      await expect(
        service.validateAndCheckRateLimit('test-key'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if rate limit is exceeded', async () => {
      redisClient.set.mockResolvedValue('OK');
      redisClient.hgetall.mockResolvedValue({
        rateLimit: '10',
        rateLimitUnit: RateLimitUnit.Minute,
        isActive: 'true',
        expirationTime: new Date(Date.now() + 10000).toISOString(),
      });
      redisClient.incr.mockResolvedValue(11);
      await expect(
        service.validateAndCheckRateLimit('test-key'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should release the lock after processing', async () => {
      redisClient.set.mockResolvedValue('OK');
      redisClient.hgetall.mockResolvedValue({
        rateLimit: '10',
        rateLimitUnit: RateLimitUnit.Minute,
        isActive: 'true',
        expirationTime: new Date(Date.now() + 10000).toISOString(),
      });
      redisClient.incr.mockResolvedValue(1);
      redisClient.del.mockResolvedValue(1);

      await service.validateAndCheckRateLimit('test-key');
      expect(redisClient.del).toHaveBeenCalledWith(
        expect.stringContaining('lock:test-key'),
      );
    });

    it('should pass if rate limit is not exceeded', async () => {
      redisClient.set.mockResolvedValue('OK');
      redisClient.hgetall.mockResolvedValue({
        rateLimit: '10',
        rateLimitUnit: RateLimitUnit.Minute,
        isActive: 'true',
        expirationTime: new Date(Date.now() + 10000).toISOString(),
      });
      redisClient.incr.mockResolvedValue(1);
      redisClient.expire.mockResolvedValue(1);

      await expect(
        service.validateAndCheckRateLimit('test-key'),
      ).resolves.not.toThrow();
    });

    it('should set TTL if it is the first request in the window', async () => {
      redisClient.set.mockResolvedValue('OK');
      redisClient.hgetall.mockResolvedValue({
        rateLimit: '10',
        rateLimitUnit: RateLimitUnit.Minute,
        isActive: 'true',
        expirationTime: new Date(Date.now() + 10000).toISOString(),
      });
      redisClient.incr.mockResolvedValue(1);
      redisClient.expire.mockResolvedValue(1);

      await service.validateAndCheckRateLimit('test-key');

      expect(redisClient.expire).toHaveBeenCalledWith(expect.any(String), 60);
    });

    it('should handle race conditions correctly', async () => {
      redisClient.set
        .mockResolvedValueOnce('OK') // First call to acquire lock
        .mockResolvedValueOnce(null); // Second call fails to acquire lock

      redisClient.hgetall.mockResolvedValue({
        rateLimit: '10',
        rateLimitUnit: RateLimitUnit.Minute,
        isActive: 'true',
        expirationTime: new Date(Date.now() + 10000).toISOString(),
      });
      redisClient.incr.mockResolvedValue(1);
      redisClient.expire.mockResolvedValue(1);

      const promise1 = service.validateAndCheckRateLimit('test-key1');
      const promise2 = service.validateAndCheckRateLimit('test-key1');

      await expect(promise1).resolves.not.toThrow();
      await expect(promise2).rejects.toThrow(ServiceUnavailableException);
    });
  });
});

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { createRedisClients } from '../config/redis.config';
import { RateLimitUnit } from '../schemas/rate-limit-unit.enum';
import { AccessKeyDetail } from './interface/access-key.-details.interface';

@Injectable()
export class RateLimiterService {
  private redisClient: Redis;
  private readonly logger = new Logger(RateLimiterService.name);
  constructor(private readonly configService: ConfigService) {
    this.redisClient = createRedisClients(this.configService).redisClient;
  }

  private getCacheKey(preffix: string, key: string): string {
    // we can use some hashing technique to secure the key
    return `${preffix}:${key}`;
  }

  async setAccessKeyData(accessKey: string, data: any): Promise<void> {
    const key = this.getCacheKey('access-key', accessKey);
    const result = await this.redisClient.hmset(key, data);
    if (result !== 'OK') {
      this.logger.log(
        JSON.stringify({
          message: 'Failed to set access key data',
          status: 'fail',
          key: accessKey,
        }),
      );
    }
  }

  async delAccessKeyData(accessKey: string): Promise<void> {
    const key = this.getCacheKey('access-key', accessKey);
    const result = await this.redisClient.del(key);
    if (!result) {
      this.logger.log(
        JSON.stringify({
          message: 'Failed to delete access key data',
          status: 'fail',
          key: accessKey,
        }),
      );
    }
  }

  private getTTL(rateLimitUnit: RateLimitUnit): number {
    const ttls = {
      [RateLimitUnit.Second]: 1,
      [RateLimitUnit.Minute]: 60,
      [RateLimitUnit.Hour]: 3600,
      [RateLimitUnit.Day]: 86400,
    };

    const ttl = ttls[rateLimitUnit];
    if (ttl === undefined) {
      throw new BadRequestException('Invalid rate limit unit');
    }

    return ttl;
  }

  async getAccessKeyDetails(accessKey: string): Promise<any> {
    const key = this.getCacheKey('access-key', accessKey);
    const keyDetails = await this.redisClient.hgetall(key);
    if (!keyDetails || Object.keys(keyDetails).length === 0) {
      this.logger.log(
        JSON.stringify({
          message: 'Access key not found',
          status: 'fail',
          key: accessKey,
        }),
      );
      throw new NotFoundException('Access key not found');
    }
    return keyDetails;
  }

  private isAccessKeyActive(keyDetails: AccessKeyDetail): boolean {
    if (!keyDetails.isActive) {
      this.logger.log(
        JSON.stringify({
          message: 'Access key not inactive',
          status: 'fail',
          key: keyDetails.accessKey,
        }),
      );
      throw new NotFoundException('Access key inactive');
    }

    return true;
  }

  private validateExpirationTime(keyDetails: AccessKeyDetail): boolean {
    // Validate expiration time
    const expirationTime = new Date(keyDetails.expirationTime);
    const currentTime = new Date();
    if (expirationTime <= currentTime) {
      this.logger.log(
        JSON.stringify({
          message: 'Access key not expired',
          status: 'fail',
          key: keyDetails.accessKey,
        }),
      );
      throw new NotFoundException('Access key expired');
    }
    return true;
  }

  private isAccesskeyExist(accessKey: string): boolean {
    if (!accessKey) {
      throw new BadRequestException('Access key is required');
    }

    return true;
  }

  private getWindow(rateLimitUnit: string): string {
    const now = new Date();
    let window: string;

    switch (rateLimitUnit) {
      case 'second':
        window = `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}${now.getUTCHours()}${now.getUTCMinutes()}${now.getUTCSeconds()}`;
        break;
      case 'minute':
        window = `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}${now.getUTCHours()}${now.getUTCMinutes()}`;
        break;
      case 'hour':
        window = `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}${now.getUTCHours()}`;
        break;
      case 'day':
        window = `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}`;
        break;
      default:
        throw new BadRequestException('Invalid rate limit unit');
    }

    return window;
  }

  async acquireLock(lockKey: string): Promise<boolean> {
    const lockValue = Date.now().toString();
    const acquired = await this.redisClient.set(lockKey, lockValue, 'EX', 1); // Set the lock with a timeout of 1 seconds

    return acquired === 'OK';
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.redisClient.del(lockKey);
  }

  async validateAndCheckRateLimit(accessKey: string): Promise<void> {
    // Validate if we are getting an access key in the request
    this.isAccesskeyExist(accessKey);

    // Acquire a distributed lock for the access key
    const lockKey = this.getCacheKey('lock', accessKey);
    const acquiredLock = await this.acquireLock(lockKey);

    try {
      if (!acquiredLock) {
        throw new ServiceUnavailableException('Unable to acquire lock');
      }

      // Extract the key details from cache
      const keyDetails = await this.getAccessKeyDetails(accessKey);

      // Verify if the token is active - not need since we are deleting it on event
      // this.isAccessKeyActive(keyDetails);

      // Verify the validity of the key according to the expiration date
      this.validateExpirationTime(keyDetails);

      // Extract rate limit and unit from the key details
      const rateLimit = parseInt(keyDetails.rateLimit, 10);
      const rateLimitUnit = keyDetails.rateLimitUnit;

      // Get the current rate limit window
      const currentWindow = this.getWindow(rateLimitUnit);

      const redisKey = this.getCacheKey(
        'rate-limit',
        `${accessKey}:${currentWindow}`,
      );

      // Increment the request count for the current window
      const currentCount = await this.redisClient.incr(redisKey);

      // Set the TTL for the rate limit window if it's the first request in the window
      if (currentCount === 1) {
        await this.redisClient.expire(redisKey, this.getTTL(rateLimitUnit));
      }

      // Check if the request count exceeds the rate limit
      if (currentCount > rateLimit) {
        this.logger.log(
          JSON.stringify({
            message: 'Rate limit exceeded',
            status: 'fail',
            key: accessKey,
          }),
        );
        throw new ForbiddenException('Rate limit exceeded');
      }
    } finally {
      // Release the lock after processing
      if (acquiredLock) {
        await this.releaseLock(lockKey);
      }
    }
  }
}

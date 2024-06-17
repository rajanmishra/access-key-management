import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { createRedisClients } from '../config/redis.config';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class RateLimiterSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(RateLimiterSubscriptionService.name);
  private subscriberClient: Redis;
  private channelName: string;

  constructor(
    private readonly rateLimitService: RateLimiterService,
    private readonly configService: ConfigService,
  ) {
    this.subscriberClient = createRedisClients(
      this.configService,
    ).subscriberClient;
    this.channelName = this.configService.get<string>('CHANNEL_NAME');
  }

  onModuleInit() {
    this.subscriberClient.subscribe(this.channelName, (err, count) => {
      if (err) {
        this.logger.log('Failed to subscribe: %s', err);
      } else {
        this.logger.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
      }
    });

    this.subscriberClient.on('message', async (channel, message) => {
      if (channel === this.channelName) {
        const { action, data } = JSON.parse(message);
        switch (action) {
          case 'create':
          case 'update':
            await this.rateLimitService.setAccessKeyData(data.accessKey, data);
            this.logger.log(
              JSON.stringify({
                message: 'Got an event',
                action,
                key: data.accessKey,
              }),
            );
            break;
          case 'delete':
          case 'patch':
            await this.rateLimitService.delAccessKeyData(data.accessKey);
            break;
        }
      }
    });
  }
}

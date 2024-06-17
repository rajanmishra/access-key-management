import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { createRedisClients } from '../config/redis.config';

@Injectable()
export class EventPublishingMiddleware implements NestMiddleware {
  private channelName;
  private subscriberClient: Redis;
  constructor(private readonly configService: ConfigService) {
    this.subscriberClient = createRedisClients(this.configService);
    this.channelName = this.configService.get<string>('CHANNEL_NAME');
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const method = req.method.toLowerCase();
    const actions = {
      post: 'create',
      put: 'update',
      delete: 'delete',
      patch: 'patch',
    };

    const action = actions[method];

    const originalSend = res.send;

    res.send = (body) => {
      res.locals.body = body;
      return originalSend.call(res, body);
    };

    res.on('finish', async () => {
      if (action && res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const response = JSON.parse(res.locals.body);
          const data = response.data || {};
          if (!data.accessKey) {
            data.accessKey = req.body.accessKey || req.params.accessKey;
          }
          await this.publishToRedis(action, data);
        } catch (error) {
          Logger.log('Unable to publish the event', error);
        }
      }
    });

    next();
  }

  private async publishToRedis(action: string, data: any): Promise<void> {
    try {
      await this.subscriberClient.publish(
        this.channelName,
        JSON.stringify({ action, data }),
      );
      Logger.log('Successfully publishished event to Redis:', action);
    } catch (error) {
      Logger.log('Failed to publish event to Redis:', error);
      throw new Error('Failed to publish event to Redis');
    }
  }
}

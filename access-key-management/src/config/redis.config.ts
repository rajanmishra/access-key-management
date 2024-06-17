import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const createRedisClients = (configService: ConfigService) => {
  const redisHost = configService.get<string>('REDIS_HOST');
  const redisPort = configService.get<number>('REDIS_PORT');

  const subscriberClient = new Redis({
    host: redisHost,
    port: redisPort,
  });

  return subscriberClient;
};

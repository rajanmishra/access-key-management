import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AccessKey, AccessKeySchema } from '../schemas/accesskey.schema';
import { EventPublishingMiddleware } from '../events/event-publishing.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessKey.name, schema: AccessKeySchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EventPublishingMiddleware).forRoutes({
      path: 'v1/api/user/accesskey/:accessKey',
      method: RequestMethod.PATCH,
    });
  }
}

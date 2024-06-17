import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AccessKey, AccessKeySchema } from '../schemas/accesskey.schema';
import { EventPublishingMiddleware } from '../events/event-publishing.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessKey.name, schema: AccessKeySchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EventPublishingMiddleware).forRoutes(
      { path: 'v1/api/admin/accesskey', method: RequestMethod.POST },
      { path: 'v1/api/admin/accesskey/:accessKey', method: RequestMethod.PUT },
      {
        path: 'v1/api/admin/accesskey/:accessKey',
        method: RequestMethod.DELETE,
      },
    );
  }
}

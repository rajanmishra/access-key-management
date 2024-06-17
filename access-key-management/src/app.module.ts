import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        minPoolSize: configService.get<number>('MONGODB_MINPOOL'),
        maxPoolSize: configService.get<number>('MONGODB_MAXPOOL'),
      }),
      inject: [ConfigService],
    }),
    AdminModule,
    UserModule,
  ],
})
export class AppModule {}

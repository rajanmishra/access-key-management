import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RateLimitUnit } from './rate-limit-unit.enum';

@Schema()
export class AccessKey extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  accessKey: string;

  @Prop({ required: true })
  rateLimit: number;

  @Prop({ required: true, enum: RateLimitUnit })
  rateLimitUnit: RateLimitUnit;

  @Prop({ required: true })
  expirationTime: Date;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const AccessKeySchema = SchemaFactory.createForClass(AccessKey);

// Middleware to update the updatedDate field on save
AccessKeySchema.pre<AccessKey>('save', function (next) {
  this.updatedAt = new Date();
  this.createdAt = new Date();
  next();
});

// Middleware to update the updatedDate field on update
AccessKeySchema.pre<AccessKey>('findOneAndUpdate', function (next) {
  this.updatedAt = new Date();
  next();
});

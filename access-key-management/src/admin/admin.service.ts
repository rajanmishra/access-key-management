import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessKey } from '../schemas/accesskey.schema';
import { CreateAccessKeyDto } from './dtos/create-access-key.dto';
import { UpdateKeyDto } from './dtos/update-access-key.dto';
import { generateRandomString } from '../utils/random-string.util';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AccessKey.name)
    private accessKeyModel: Model<AccessKey>,
  ) {}

  async generateAccessKey(
    createAccessKeyDto: CreateAccessKeyDto,
  ): Promise<AccessKey> {
    const { userId, rateLimit, rateLimitUnit, expirationTime } =
      createAccessKeyDto;
    const accessKey: string = generateRandomString(userId, 32);
    const newKey: AccessKey = await this.accessKeyModel.create({
      accessKey,
      userId,
      rateLimit,
      rateLimitUnit,
      expirationTime,
    });
    return newKey;
  }

  async deleteAccessKey(accessKey: string): Promise<any> {
    return this.accessKeyModel.deleteOne({ accessKey });
  }

  async listAccessKeys(limit: number, next?: string) {
    let query = {};
    if (next) {
      query = { _id: { $gt: next } };
    }

    const results: AccessKey[] = await this.accessKeyModel
      .find(query)
      .limit(limit);
    const nextCursor =
      results.length && results.length === limit
        ? results[results.length - 1]._id
        : null;

    return {
      data: results,
      nextCursor,
      limit,
    };
  }

  async updateAccessKey(
    accessKey: string,
    updateKeyDto: UpdateKeyDto,
  ): Promise<AccessKey> {
    const updatedKey = await this.accessKeyModel.findOneAndUpdate(
      { accessKey },
      { ...updateKeyDto },
      { new: true },
    );
    if (!updatedKey) {
      throw new NotFoundException('Access key not found');
    }
    return updatedKey;
  }
}

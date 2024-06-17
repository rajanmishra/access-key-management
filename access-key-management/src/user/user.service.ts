import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessKey } from '../schemas/accesskey.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(AccessKey.name)
    private readonly accessKeyModel: Model<AccessKey>,
  ) {}

  async getPlanDetails(accessKey: string): Promise<AccessKey> {
    const keyDetails: AccessKey = await this.accessKeyModel.findOne({
      accessKey,
    });
    if (!keyDetails) {
      throw new NotFoundException('Access key not found');
    }
    return keyDetails;
  }

  async disableKey(accessKey: string): Promise<any | null> {
    return this.accessKeyModel.findOneAndUpdate(
      { accessKey },
      { isActive: false },
      { new: true },
    );
  }
}

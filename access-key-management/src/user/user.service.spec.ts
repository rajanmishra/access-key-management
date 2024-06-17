import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessKey } from '../schemas/accesskey.schema';

describe('UserService', () => {
  let userService: UserService;
  let accessKeyModel: Model<AccessKey>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(AccessKey.name),
          useValue: Model,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    accessKeyModel = module.get<Model<AccessKey>>(
      getModelToken(AccessKey.name),
    );
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should get plan details', async () => {
    const accessKey = 'test-access-key';
    const mockAccessKey = {
      _id: 'some-id',
      accessKey,
      rateLimit: 10,
      rateLimitUnit: 'minute',
      expirationTime: '2024-12-31T23:59:59Z',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest
      .spyOn(accessKeyModel, 'findOne')
      .mockResolvedValue(mockAccessKey as unknown as AccessKey);

    const result = await userService.getPlanDetails(accessKey);
    expect(result).toEqual(mockAccessKey);
  });

  it('should disable key', async () => {
    const accessKey = 'test-access-key';
    const mockUpdatedKey = {
      _id: 'some-id',
      accessKey,
      rateLimit: 10,
      rateLimitUnit: 'minute',
      expirationTime: '2024-12-31T23:59:59Z',
      isActive: false, // Updated isActive value
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest
      .spyOn(accessKeyModel, 'findOneAndUpdate')
      .mockResolvedValue(mockUpdatedKey as unknown as AccessKey);

    const result = await userService.disableKey(accessKey);
    expect(result).toEqual(mockUpdatedKey);
  });
});

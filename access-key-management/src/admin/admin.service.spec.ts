import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { AccessKey } from '../schemas/accesskey.schema';
import { RateLimitUnit } from '../schemas/rate-limit-unit.enum';
import { CreateAccessKeyDto } from './dtos/create-access-key.dto';
import { UpdateKeyDto } from './dtos/update-access-key.dto';

describe('AdminService', () => {
  let adminService: AdminService;
  let accessKeyModel: Model<AccessKey>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(AccessKey.name),
          useValue: Model,
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
    accessKeyModel = module.get<Model<AccessKey>>(
      getModelToken(AccessKey.name),
    );
  });

  it('should be defined', () => {
    expect(adminService).toBeDefined();
  });

  it('should generate access key', async () => {
    const createAccessKeyDto: CreateAccessKeyDto = {
      userId: 'user-id',
      rateLimit: 10,
      rateLimitUnit: RateLimitUnit['minute'],
      expirationTime: new Date('2024-12-31T23:59:59Z'),
    };

    jest.spyOn(accessKeyModel, 'create').mockResolvedValueOnce({
      ...createAccessKeyDto,
      _id: 'mocked-id',
      accessKey: 'generated-access-key',
      isActive: true,
    } as any);

    const result = await adminService.generateAccessKey(createAccessKeyDto);
    expect(result).toEqual({
      ...createAccessKeyDto,
      _id: 'mocked-id',
      accessKey: 'generated-access-key',
      isActive: true,
    });
  });

  it('should delete access key', async () => {
    const accessKey = 'test-access-key';
    jest
      .spyOn(accessKeyModel, 'deleteOne')
      .mockResolvedValueOnce({ acknowledged: true, deletedCount: 1 });

    const result = await adminService.deleteAccessKey(accessKey);
    expect(result).toEqual({ acknowledged: true, deletedCount: 1 });
  });

  it('should list access keys', async () => {
    const mockAccessKeys = [
      {
        accessKey: 'key1',
        userId: 'user1',
        rateLimit: 10,
        rateLimitUnit: 'minute',
        expirationTime: new Date(),
        isActive: true,
      },
      {
        accessKey: 'key2',
        userId: 'user2',
        rateLimit: 20,
        rateLimitUnit: 'hour',
        expirationTime: new Date(),
        isActive: true,
      },
    ];

    const limit = 10;
    const cursor = 'cursor_value';

    const mockQuery: Partial<Query<any[], any>> = {
      limit: jest.fn().mockResolvedValueOnce(mockAccessKeys),
    };

    jest.spyOn(accessKeyModel, 'find').mockReturnValueOnce(mockQuery as any);

    const result = await adminService.listAccessKeys(limit, cursor);
    expect(result.data).toEqual(mockAccessKeys);
  });

  it('should update access key', async () => {
    const accessKey = 'test-access-key';
    const updateKeyDto: UpdateKeyDto = {
      rateLimit: 15,
      rateLimitUnit: RateLimitUnit['hour'],
      expirationTime: new Date('2025-12-31T23:59:59Z'),
      isActive: true,
    };
    const updatedKey = { accessKey, ...updateKeyDto };

    jest
      .spyOn(accessKeyModel, 'findOneAndUpdate')
      .mockResolvedValueOnce(updatedKey as unknown as AccessKey);

    const result = await adminService.updateAccessKey(accessKey, updateKeyDto);
    expect(result).toEqual(updatedKey);
  });
});

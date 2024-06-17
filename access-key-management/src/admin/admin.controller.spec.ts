import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { CreateAccessKeyDto } from './dtos/create-access-key.dto';
import { UpdateKeyDto } from './dtos/update-access-key.dto';
import { AccessKeyResponseDto } from './dtos/access-key-response.dto';
import { CursorPaginationQueryDto } from './dtos/cursor-pagination-query.dto';
import { NotFoundException } from '@nestjs/common';
import { response } from '../common/response/apiResponse';
import { RateLimitUnit } from '../schemas/rate-limit-unit.enum';
import { AccessKey } from 'src/schemas/accesskey.schema';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
        {
          provide: getModelToken('AccessKey'),
          useValue: {}, // Mock your model or use a real model instance
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateAccessKey', () => {
    it('should generate access key', async () => {
      const createAccessKeyDto: CreateAccessKeyDto = {
        userId: 'user-id',
        rateLimit: 10,
        rateLimitUnit: RateLimitUnit['minute'],
        expirationTime: new Date('2024-12-31T23:59:59Z'),
      };
      const expectedResult: AccessKeyResponseDto = {
        accessKey: 'generated-access-key',
        ...createAccessKeyDto,
        _id: '',
        createdAt: '',
        updatedAt: '',
        __v: 0,
        isActive: true,
      };
      jest
        .spyOn(service, 'generateAccessKey')
        .mockResolvedValueOnce(expectedResult as unknown as AccessKey);

      const result = await controller.generateAccessKey(createAccessKeyDto);
      expect(result).toEqual(
        new response('Access key generated successfully', expectedResult, 201),
      );
    });
  });

  describe('deleteAccessKey', () => {
    it('should delete access key', async () => {
      const accessKey = 'test-access-key';
      jest.spyOn(service, 'deleteAccessKey').mockResolvedValueOnce(undefined);

      const result = await controller.deleteAccessKey(accessKey);
      expect(result).toEqual(
        new response('Access key deleted successfully', null, 204),
      );
    });
  });

  describe('listAccessKeys', () => {
    it('should list access keys', async () => {
      const limit = 10;
      const next = 'next-cursor';
      const paginationQuery: CursorPaginationQueryDto = { next };
      const expectedResult = {
        data: [],
        nextCursor: 'next-cursor',
        limit: 10,
      };
      jest
        .spyOn(service, 'listAccessKeys')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.listAccessKeys(limit, paginationQuery);
      expect(result).toEqual(
        new response(
          'List of access keys retrieved successfully',
          [],
          200,
          10,
          'next-cursor',
        ),
      );
    });
  });

  describe('updateAccessKey', () => {
    it('should update access key', async () => {
      const accessKey = 'test-access-key';
      const updateKeyDto: UpdateKeyDto = {
        rateLimit: 15,
        rateLimitUnit: RateLimitUnit['hour'],
        expirationTime: new Date('2025-12-31T23:59:59Z'),
      };
      const updatedKey: AccessKeyResponseDto = {
        accessKey,
        rateLimit: 15,
        rateLimitUnit: RateLimitUnit['hour'],
        expirationTime: new Date('2025-12-31T23:59:59Z'),
        userId: '',
        _id: '',
        createdAt: '',
        updatedAt: '',
        __v: 0,
        isActive: true,
      };
      jest
        .spyOn(service, 'updateAccessKey')
        .mockResolvedValueOnce(updatedKey as unknown as AccessKey);

      const result = await controller.updateAccessKey(accessKey, updateKeyDto);
      expect(result).toEqual(
        new response('Access key updated successfully', updatedKey, 200),
      );
    });

    it('should handle not found error during update', async () => {
      const accessKey = 'non-existent-access-key';
      const updateKeyDto: UpdateKeyDto = {
        rateLimit: 15,
        rateLimitUnit: RateLimitUnit['hour'],
        expirationTime: new Date('2025-12-31T23:59:59Z'),
      };
      jest
        .spyOn(service, 'updateAccessKey')
        .mockRejectedValueOnce(new NotFoundException('Access key not found'));

      await expect(
        controller.updateAccessKey(accessKey, updateKeyDto),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});

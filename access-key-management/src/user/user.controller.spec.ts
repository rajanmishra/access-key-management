import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { response } from '../common/response/apiResponse';
import { RateLimitUnit } from '../schemas/rate-limit-unit.enum';
import { AccessKey } from 'src/schemas/accesskey.schema';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken('AccessKey'),
          useValue: {},
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getPlanDetails', () => {
    it('should return plan details', async () => {
      const accessKey = 'test-access-key';
      const keyDetails = {
        accessKey,
        rateLimit: 15,
        rateLimitUnit: RateLimitUnit['hour'],
        expirationTime: new Date('2025-12-31T23:59:59Z'),
        isActive: true,
      };
      jest
        .spyOn(userService, 'getPlanDetails')
        .mockResolvedValueOnce(keyDetails as unknown as AccessKey);

      const result = await userController.getPlanDetails(accessKey);
      expect(result).toEqual(
        new response('Plan details retrieved successfully', keyDetails, 200),
      );
    });
  });

  describe('disableKey', () => {
    it('should disable the access key', async () => {
      const accessKey = 'test-access-key';
      jest.spyOn(userService, 'disableKey').mockResolvedValueOnce(true);

      const result = await userController.disableKey(accessKey);
      expect(result).toEqual(
        new response('Access key disabled successfully', null, 200),
      );
    });
  });
});

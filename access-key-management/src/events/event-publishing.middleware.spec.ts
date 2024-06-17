import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventPublishingMiddleware } from './event-publishing.middleware';
import { Request, Response, NextFunction } from 'express';

jest.mock('../config/redis.config');

describe('EventPublishingMiddleware', () => {
  let middleware: EventPublishingMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let finishCallbacks: (() => void)[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventPublishingMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'CHANNEL_NAME') return 'test-channel';
            }),
          },
        },
      ],
    }).compile();

    middleware = module.get<EventPublishingMiddleware>(
      EventPublishingMiddleware,
    );

    finishCallbacks = [];

    mockRequest = {
      method: 'POST',
      body: {
        accessKey: 'test-access-key',
      },
    };

    mockResponse = {
      statusCode: 200,
      locals: {},
      send: jest.fn(function (this: Response, body) {
        this.locals.body = body;
        finishCallbacks.forEach((callback) => callback());
        return this;
      }) as any,
      on: jest.fn(function (this: Response, event, callback) {
        if (event === 'finish') {
          finishCallbacks.push(callback);
        }
        return this;
      }) as any,
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next function', async () => {
    await middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalled();
  });
});

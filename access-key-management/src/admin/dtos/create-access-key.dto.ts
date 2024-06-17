import { IsString, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RateLimitUnit } from '../../schemas/rate-limit-unit.enum';

export class CreateAccessKeyDto {
  @ApiProperty({
    description: 'user id',
    required: true,
    type: 'string',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'rate limit value i.e. 10',
    required: true,
    type: 'number',
    default: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Rate limit value must be greater than 0' })
  rateLimit: number;

  @ApiProperty({
    description: 'rate limit unit possible value: second, minute, hour',
    required: true,
    enum: RateLimitUnit,
  })
  @IsEnum(RateLimitUnit, {
    message:
      'Rate limit unit must be one of the following values: second, minute, hour',
  })
  rateLimitUnit: RateLimitUnit;

  @ApiProperty({
    description: 'Expiration date: 2024-12-31T23:59:59Z',
    required: true,
    type: Date,
  })
  @IsDateString()
  expirationTime: Date;
}

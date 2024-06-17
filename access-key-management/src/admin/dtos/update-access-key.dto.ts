import {
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { RateLimitUnit } from '../../schemas/rate-limit-unit.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateKeyDto {
  @ApiPropertyOptional({
    description: 'rate limit value i.e. 10',
    required: true,
    type: 'number',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Rate limit value must be greater than 0' })
  rateLimit?: number;

  @ApiPropertyOptional({
    description: 'rate limit unit possible value minute, second, hour',
    required: true,
    enum: RateLimitUnit,
  })
  @IsOptional()
  @IsEnum(RateLimitUnit, {
    message:
      'Rate limit unit must be one of the following values: second, minute, hour',
  })
  rateLimitUnit?: RateLimitUnit;

  @ApiPropertyOptional({
    description: 'Expiration date: 2024-12-31T23:59:59Z',
    required: true,
    type: Date,
  })
  @IsDateString()
  expirationTime: Date;

  @ApiPropertyOptional({
    description: 'status of token',
    required: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

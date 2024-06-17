import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RateLimitUnit } from '../../schemas/rate-limit-unit.enum';

export class AccessKeyResponseDto {
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
  rateLimit: number;

  @ApiProperty({
    description: 'rate limit unit possible value: second, minute, hour',
    required: true,
    enum: RateLimitUnit,
  })
  @IsEnum(RateLimitUnit)
  rateLimitUnit: RateLimitUnit;

  @ApiProperty({
    description: 'Expiration date: 2024-12-31T23:59:59Z',
    required: true,
    type: Date,
  })
  @IsDateString()
  expirationTime: Date;

  @ApiProperty({
    description: 'AccessKey generated',
    required: true,
    type: 'string',
  })
  @IsString()
  accessKey: string;

  @ApiProperty({
    description: 'Status of the key if active',
    required: true,
    type: 'boolean',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Database ID' })
  @IsOptional()
  _id: string;

  @ApiPropertyOptional({
    description: 'Creation date: 2024-12-31T23:59:59Z',
    required: false,
    type: Date,
  })
  @IsDateString()
  @IsOptional()
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Update date: 2024-12-31T23:59:59Z',
    required: false,
    type: Date,
  })
  @IsDateString()
  @IsOptional()
  updatedAt: string;

  @ApiPropertyOptional({ description: 'Version' })
  @IsOptional()
  __v: number;
}

import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'Token Namr',
    required: true,
    type: 'string',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Token Symbol',
    required: true,
    type: 'string',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Token Price',
    required: true,
    type: 'number',
    default: 0,
  })
  @IsNumber()
  price_usd: number;

  @ApiProperty({
    description: 'Market CAP USD',
    required: true,
    type: 'number',
    default: 0,
  })
  @IsNumber()
  market_cap_usd: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CursorPaginationQueryDto {
  @ApiProperty({
    required: false,
    description: 'Cursor for the next set of results',
  })
  @IsOptional()
  @IsString()
  next?: string;
}

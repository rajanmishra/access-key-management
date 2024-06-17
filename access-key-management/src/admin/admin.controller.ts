import {
  Controller,
  Post,
  Delete,
  Get,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAccessKeyDto } from './dtos/create-access-key.dto';
import { UpdateKeyDto } from './dtos/update-access-key.dto';
import { NotFoundException } from '@nestjs/common';
import { response } from '../common/response/apiResponse';
import { CursorPaginationQueryDto } from './dtos/cursor-pagination-query.dto';
import { AccessKeyResponseDto } from './dtos/access-key-response.dto';

@ApiTags('Admin')
@Controller('v1/api/admin/')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiResponse({
    status: 201,
    description: 'Access key generated successfully',
    type: AccessKeyResponseDto,
  })
  @Post('accesskey')
  async generateAccessKey(@Body() createAccessKeyDto: CreateAccessKeyDto) {
    const accessKey =
      await this.adminService.generateAccessKey(createAccessKeyDto);
    return new response('Access key generated successfully', accessKey, 201);
  }

  @ApiResponse({ status: 204, description: 'Access key deleted successfully' })
  @Delete('accesskey/:accessKey')
  async deleteAccessKey(@Param('accessKey') accessKey: string) {
    await this.adminService.deleteAccessKey(accessKey);
    return new response('Access key deleted successfully', null, 204);
  }

  @ApiResponse({
    status: 200,
    description: 'List of access keys retrieved successfully',
    type: [AccessKeyResponseDto],
  })
  @Get('accesskeys')
  async listAccessKeys(
    @Query('limit', ParseIntPipe) limit: number,
    @Query() paginationQuery: CursorPaginationQueryDto,
  ) {
    const { next } = paginationQuery;
    const paginatedResults = await this.adminService.listAccessKeys(
      limit,
      next,
    );
    return new response(
      'List of access keys retrieved successfully',
      paginatedResults.data,
      200,
      paginatedResults.limit as number,
      paginatedResults.nextCursor as string,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'Access key updated successfully',
    type: AccessKeyResponseDto,
  })
  @Put('accesskey/:accessKey')
  async updateAccessKey(
    @Param('accessKey') accessKey: string,
    @Body() updateKeyDto: UpdateKeyDto,
  ) {
    const updatedAccessKey = await this.adminService.updateAccessKey(
      accessKey,
      updateKeyDto,
    );
    if (!updatedAccessKey) {
      throw new NotFoundException('Access key not found');
    }
    return new response(
      'Access key updated successfully',
      updatedAccessKey,
      200,
    );
  }
}

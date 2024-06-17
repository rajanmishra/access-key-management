import { Controller, Get, Patch, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { response } from '../common/response/apiResponse';
import { AccessKeyResponseDto } from '../admin/dtos/access-key-response.dto';

@ApiTags('User')
@Controller('v1/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    status: 200,
    description: 'Plan details retrieved successfully',
    type: AccessKeyResponseDto,
  })
  @Get('accesskey/:accessKey')
  async getPlanDetails(@Param('accessKey') accessKey: string) {
    const keyDetails = await this.userService.getPlanDetails(accessKey);
    return new response('Plan details retrieved successfully', keyDetails, 200);
  }

  @ApiResponse({ status: 200, description: 'Access key disabled successfully' })
  @Patch('accesskey/:accessKey')
  async disableKey(@Param('accessKey') accessKey: string) {
    await this.userService.disableKey(accessKey);
    return new response('Access key disabled successfully', null, 200);
  }
}

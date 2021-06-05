import { Body, Controller, Get, Inject, Logger, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { omit } from 'lodash';
import { UserEntity } from '@entities';
import { TenantAwareContext } from '@modules/database';
import { UserService } from './user.service';
import {ChangeUserInfoDTO} from './user.dto';
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}

  private readonly logger = new Logger(UserController.name);

  @Get('me')
  async getUserDetail(): Promise<Partial<UserEntity>> {
    return omit(await this.userService.getUserById(this.context.userId), 'password');
  }
  @Patch('me')
  async updateUserInfo(@Body() updatedInfo:ChangeUserInfoDTO): Promise<void>{
    //console.log(updatedInfo);
    return await this.userService.changeUserInfo(updatedInfo);
  }
}

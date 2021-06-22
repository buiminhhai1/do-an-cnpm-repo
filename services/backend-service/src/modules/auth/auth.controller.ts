import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '@modules/user';
import { AdminGuard } from './admin.guard';
import {
  ChangePasswordDTO,
  CredentialDTO,
  GenericUserResponse,
  LoginDTO,
  PaginationAuthDTO,
  PayloadDTO,
  
} from './auth.dto';
import { AuthService } from './auth.service';
import { UserEntity } from '@entities';
import { Observable, of } from 'rxjs';

@Controller('auth')
@ApiTags('Credential')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() payload: CredentialDTO): Promise<Partial<UserEntity>> {
    return await this.userService.register(payload);
  }

  @Post('login')
  async login(@Body() payload: LoginDTO): Promise<PayloadDTO> {
    const credential = await this.userService.veriffyUser(payload);
    if (!credential) {
      throw new UnauthorizedException();
    }
    return await this.authService.login(credential);
  }

  @Get('users')
  @UseGuards(new AdminGuard())
  async getUsers(@Query() payload: PaginationAuthDTO): Promise<GenericUserResponse> {
    return await this.userService.getUsers(payload);
  }

  @Get('admin')
  async verifyAdminMiddleware(): Promise<boolean> {
    return true;
  }

  @Patch('password')
  async changePassword(@Body() payload: ChangePasswordDTO): Promise<void> {
    return await this.userService.changePassword(payload.passwordUpdated);
  }
 
}

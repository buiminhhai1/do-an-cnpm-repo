import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
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
  TokenJWTDTO,
} from './auth.dto';
import { AuthService } from './auth.service';
import { UserEntity } from '@entities';
import { MailService } from './../mail/mail.service';

@Controller('auth')
@ApiTags('Credential')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Post('register')
  async register(@Body() payload: CredentialDTO): Promise<Partial<UserEntity>> {
    return await this.userService.register(payload);
  }

  @Post('login')
  async login(@Body() payload: LoginDTO): Promise<TokenJWTDTO> {
    const credential = await this.userService.veriffyUser(payload);
    if (!credential) {
      throw new UnauthorizedException();
    }
    await this.mailService.sendEmail(credential);
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

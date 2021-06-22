import { UserEntity } from '@entities';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayloadDTO, PayloadDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtSevice: JwtService) {}

  async encode(payload: Partial<AuthPayloadDTO>): Promise<string> {
    return this.jwtSevice.signAsync(payload);
  }

  async decode(token: string): Promise<AuthPayloadDTO> {
    try {
      return await this.jwtSevice.verifyAsync(token);
    } catch (err) {
      throw new UnauthorizedException('Access Token illegal');
    }
  }
  async login(payload: Partial<UserEntity>): Promise<PayloadDTO> {
    return {
      id: payload.id,
      username: payload.username,
      access_token: await this.encode(payload),
    };
  }
}

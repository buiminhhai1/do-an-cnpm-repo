import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserRole, UserEntity } from '@entities';

export class PayloadDTO {
  public id: string;
  public username: string;
  public access_token: string;
}

export class LoginDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public password: string;
}

export class CredentialDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public phoneNumber: string;

  @ApiProperty()
  @IsString()
  public address: string;

  @ApiProperty({ enum: UserRole, examples: [UserRole.user, UserRole.admin] })
  @IsEnum(UserRole)
  public role: UserRole;
}

export class PaginationAuthDTO {
  @ApiProperty()
  page: string;

  @ApiProperty()
  limit: string;
}

export class GenericUserResponse {
  data: Partial<UserEntity>[];
  total: number;
  next: number;
}

export class AuthPayloadDTO {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  id: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class ChangePasswordDTO {
  @ApiProperty()
  passwordUpdated: string;
}

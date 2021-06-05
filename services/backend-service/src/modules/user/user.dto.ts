import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
export class ChangeUserInfoDTO {
    @ApiProperty()
    @IsString()
    firstName: string;
  
    @ApiProperty()
    @IsString()
    lastName: string;
  
    @ApiProperty()
    @IsEmail()
    email: string;
  
    @ApiProperty()
    @IsString()
    phoneNumber: string;
  
    @ApiProperty()
    @IsString()
    address: string;
}
  
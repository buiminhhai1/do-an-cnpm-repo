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

// MARK:- Upload image
/**
 * Body: payload
 */
 export class UploadProfileImageDTO {
    @ApiProperty()
    // @IsString()
    public imageId: any;
  }
  

  export class imageDTO {
    @ApiProperty()
    @IsString()
    public imageId: string;
  }

 
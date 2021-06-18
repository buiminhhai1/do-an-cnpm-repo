import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public contractId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public subject: string;
}

/**
 * Data Response
 */
export class DataResponse {
  data: any;
  message?: string;
}

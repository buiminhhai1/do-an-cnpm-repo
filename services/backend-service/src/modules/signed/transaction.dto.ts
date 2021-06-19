import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum StatusContract {
  sign = 'sign',
  destroy = 'destroy',
}

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

export class ReturnDTO {
  @ApiProperty({ enum: StatusContract, examples: [StatusContract.sign, StatusContract.destroy] })
  @IsEnum(StatusContract)
  @IsOptional()
  status?: StatusContract = StatusContract.sign;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public contractId: string;
}

/**
 * Data Response
 */
export class DataResponse {
  data: any;
  message?: string;
}

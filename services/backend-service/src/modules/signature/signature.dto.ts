/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public contractId: string;
}

export class VerifyDTO {
  @ApiProperty()
  @IsString()
  public contractId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public signature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public email: string;
}

export class ContractFileDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public files: any;
}

/**
 * Data Response
 */
export class DataResponse {
  data: any;
  message?: string;
}

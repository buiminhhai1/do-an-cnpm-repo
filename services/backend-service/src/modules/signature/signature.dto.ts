/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignDTO {
  @ApiProperty()
  @IsString()
  public contractId: string;
}

export class VerifyDTO {
  @ApiProperty()
  @IsString()
  public signature: string;

  @ApiProperty()
  @IsString()
  public email: string;
}

export class ContractFileDTO {
  @ApiProperty()
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

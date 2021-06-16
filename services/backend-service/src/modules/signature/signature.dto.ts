/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GenerateKey {
  @ApiProperty()
  // @IsString()
  public response: any;
}

export class SignDTO {
  @ApiProperty()
  // @IsString()
  public contractId: string;
}

/**
 * Data Response
 */
export class DataResponse {
  data: any;
  message?: string;
}

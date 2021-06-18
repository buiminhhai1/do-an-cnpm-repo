/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ContractEntity } from '../../entities';

export class SignDTO {
  @ApiProperty()
  @IsString()
  public contractId: string;
}

export class VerifyDTO {
  @ApiProperty()
  @IsString()
  public contractId?: string;

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

export class PaginationContractDTO {
  @ApiProperty()
  page: string;

  @ApiProperty()
  limit: string;
}

export class GenericContractResponse {
  data: Partial<ContractEntity>[];
  total: number;
  next: number;
}

/**
 * Data Response
 */
export class DataResponse {
  data: any;
  message?: string;
}

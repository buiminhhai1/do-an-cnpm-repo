/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ContractEntity, Status } from '@entities';

// MARK:- Upload file
/**
 * Body: payload
 */
export class UploadDTO {
  @ApiProperty()
  // @IsString()
  public files: any;
}

// MARK:- Delete file
/**
 * Query: _query
 */
export class FileDetailDTO {
  @ApiProperty()
  @IsString()
  public contractId: string;
}

// MARK:- Delete file
/**
 * Query: _query
 */
export class DeleteDTO {
  @ApiProperty()
  @IsString()
  public contractId: string;
}

export class PaginationContractDTO {
  @ApiProperty()
  type?: Status = null;

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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ContractEntity, Status, Type } from '@entities';

// MARK:- Upload file
/**
 * Body: payload
 */
export class UploadDTO {
  @ApiProperty()
  @IsString()
  public userId?: string;

  @ApiProperty()
  @IsNotEmpty()
  public files: any;
}

// MARK:- Delete file
/**
 * Query: _query
 */
export class FileDetailDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public contractId: string;
}

// MARK:- Delete file
/**
 * Query: _query
 */
export class DeleteDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public contractId: string;
}

export class PaginationContractDTO {
  @ApiProperty({ enum: Status, examples: [Status.signed, Status.unsigned, null] })
  @IsEnum(Status)
  @IsOptional()
  status?: Status = null;

  @ApiProperty({ enum: Type, examples: [Type.owner, Type.receiver, Type.sender, null] })
  @IsEnum(Type)
  @IsOptional()
  type?: Type = null;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  page: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
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

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// MARK:- Upload file
/**
 * Body: payload
 */
export class UploadDTO {
  @ApiProperty()
  // @IsString()
  public files: any;
}
/**
 * Data Response
 */
export class UploadStatusResponse {
  public id: string;
  public name: string;
  public type: string;
}
// MARK:- List file
/**
 * Data Response
 */
export class ListFileDataResponse {
  public fileId: string;
  public publicLink: string;
  public download: string;
}
// MARK:- Delete file
/**
 * Query: _query
 */
export class DeleteDTO {
  @ApiProperty()
  @IsString()
  public fileId: string;
}
/**
 * Data Response
 */
export class DeleteDataResponse {
  public data: any;
}

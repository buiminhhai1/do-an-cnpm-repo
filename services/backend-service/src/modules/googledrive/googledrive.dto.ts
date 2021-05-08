import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// MARK:- Upload file
/**
 * Body: payload
 */
export class UploadDTO {
  @ApiProperty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsString()
  public type: string;

  @ApiProperty()
  @IsString()
  public file: string;
}
/**
 * Data Response
 */
export class UploadDataDTO {
  public id: string;
  public name: string;
  public type: string;
}
// _______________
export class UploadStatusResponse {
  public statusCode: number;
  public data: UploadDataDTO = new UploadDataDTO();
  public reNewData(): void {
    this.statusCode = 401;
    this.data.id = '';
    this.data.name = '';
    this.data.type = '';
  }
}
// MARK:- List file
/**
 * Data Response
 */
export class ListFileDataResponse {
  public statusCode: number;
  public data: any;
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
  public statusCode: number;
  public data: any;
}

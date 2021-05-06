import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadDTO {
  @ApiProperty()
  // @IsString()
  public name: string;

  @ApiProperty()
  public file: string;
}

export class UploadStatusResponse {
  public status: boolean;
  public kind: string;
  public id: string;
  public name: string;
  public mimeType: string;
}

export class SignleFileDTO {
  @ApiProperty()
  @IsString()
  public userID: string;

  @ApiProperty()
  @IsString()
  public fileID: string;
}

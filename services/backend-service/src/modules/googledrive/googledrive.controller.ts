import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { omit } from 'lodash';
import { GoogleDriveService } from './googledrive.service';
import {
  DeleteDataResponse,
  DeleteDTO,
  ListFileDataResponse,
  UploadDTO,
  UploadStatusResponse,
} from './googledrive.dto';

@Controller('googledrive')
@ApiTags('Googledrive')
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Post('new_file')
  async uploadFile(@Body() payload: UploadDTO): Promise<UploadStatusResponse> {
    return omit(await this.googleDriveService.uploadFile(payload));
  }

  @Get('list_file')
  async listFile(): Promise<ListFileDataResponse> {
    return omit(await this.googleDriveService.getAllFile());
  }

  @Delete('single_file')
  async deleteFile(@Query() _query: DeleteDTO): Promise<DeleteDataResponse> {
    return omit(await this.googleDriveService.deleteFile(_query));
  }
}

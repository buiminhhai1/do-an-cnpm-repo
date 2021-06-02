import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { omit } from 'lodash';
import { GoogleStorageService } from './googlestorage.service';
import {
  DeleteDataResponse,
  DeleteDTO,
  ListFileDataResponse,
  UploadDTO,
  UploadStatusResponse,
} from './googlestorage.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('googlestorage')
@ApiTags('GoogleStorage')
export class GoogleStorageController {
  constructor(private readonly googleStorageService: GoogleStorageService) {}

  @Post('files')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(@Req() payload: UploadDTO): Promise<{ data: UploadStatusResponse }> {
    return omit(await this.googleStorageService.uploadFile(payload));
  }

  @Get('files')
  async listFile(): Promise<{ data: ListFileDataResponse[] }> {
    return omit(await this.googleStorageService.getAllFile());
  }

  @Delete('files')
  async deleteFile(@Query() _query: DeleteDTO): Promise<DeleteDataResponse> {
    return omit(await this.googleStorageService.deleteFile(_query));
  }
}

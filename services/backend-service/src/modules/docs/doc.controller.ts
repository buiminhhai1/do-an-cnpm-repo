import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { omit } from 'lodash';
import { DocumentService } from './doc.service';
import { UploadDTO, UploadStatusResponse } from './doc.dto';

@Controller('documents')
@ApiTags('Documents')
export class DocumentController {
  constructor(private readonly docService: DocumentService) {}

  @Post('drive')
  async uploadFile(@Body() payload: UploadDTO): Promise<UploadStatusResponse> {
    return omit(await this.docService.uploadFile(payload));
  }

  // @Get('singeFile')
  // async signleFile(@Query() payload: SignleFileDTO): Promise<string> {
  //     return omit(await this.docService.singleFile(payload));
  // }
}

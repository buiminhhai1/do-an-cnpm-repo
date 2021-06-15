/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { omit } from 'lodash';
import { GoogleStorageService } from './googlestorage.service';
import { DeleteDTO, FileDetailDTO, UploadDTO, DataResponse } from './googlestorage.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Payload } from '@nestjs/microservices';

@Controller('google_storage')
@ApiTags('GoogleStorage')
export class GoogleStorageController {
  constructor(private readonly googleStorageService: GoogleStorageService) {}

  @Post('contracts')
  @UseInterceptors(FilesInterceptor('contract'))
  async uploadContract(@Req() payload: UploadDTO): Promise<DataResponse> {
    return omit(await this.googleStorageService.uploadContract(payload));
  }

  @Put('contracts')
  @UseInterceptors(FilesInterceptor('contract'))
  async dataContract(
    @Req() contractFile: UploadDTO,
    @Body() Payload: FileDetailDTO,
  ): Promise<DataResponse> {
    return omit(await this.googleStorageService.updateContract(contractFile, Payload));
  }

  @Get('contracts')
  async listContract(): Promise<DataResponse> {
    return omit(await this.googleStorageService.getAllContract());
  }

  @Get('contracts/single_contract')
  async getDetailContract(@Query() payload: FileDetailDTO): Promise<DataResponse> {
    return omit(await this.googleStorageService.getDetailContract(payload));
  }

  @Delete('contracts')
  async deleteContract(@Query() _query: DeleteDTO): Promise<DataResponse> {
    return omit(await this.googleStorageService.deleteContract(_query));
  }
}

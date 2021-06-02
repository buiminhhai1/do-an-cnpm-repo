/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Delete, Get, Post, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { omit } from 'lodash';
import { GoogleStorageService } from './googlestorage.service';
import { DeleteDTO, FileDetailDTO, UploadDTO, DataResponse } from './googlestorage.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Status } from '@entities';

@Controller('google_storage')
@ApiTags('GoogleStorage')
export class GoogleStorageController {
  constructor(private readonly googleStorageService: GoogleStorageService) {}

  @Post('stores')
  async createStore(): Promise<any> {
    return omit(await this.googleStorageService.createStore());
  }

  @Post('contracts')
  @UseInterceptors(FilesInterceptor('contract'))
  async uploadContract(@Req() payload: UploadDTO): Promise<DataResponse> {
    return omit(await this.googleStorageService.uploadContract(payload));
  }

  @Get('contracts')
  async listContract(): Promise<DataResponse> {
    return omit(await this.googleStorageService.getAllContract(undefined));
  }

  @Get('contracts/unsigned')
  async listContractUnsigned(): Promise<DataResponse> {
    return omit(await this.googleStorageService.getAllContract(Status.unsigned));
  }

  @Get('contracts/signed')
  async listContractSigned(): Promise<DataResponse> {
    return omit(await this.googleStorageService.getAllContract(Status.signed));
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

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { SignDTO, DataResponse } from './signature.dto';
import { SignatureService } from './signature.service';

@Controller('signatures')
@ApiTags('Signatures')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Get()
  async generateKey() {
    await this.signatureService.createSignature();
  }

  @Post('signing')
  async signingContract(@Query() payload: SignDTO): Promise<boolean> {
    return await this.signatureService.signing(payload);
  }

  // @Post('verify')
  // verifyContract(playload: SignDTO): string {
  //   return this.signatureService.RSASign(
  //     playload.files.privateKey[0].buffer.toString('utf8'),
  //     playload.files.contract[0].buffer,
  //   );
  // }
}

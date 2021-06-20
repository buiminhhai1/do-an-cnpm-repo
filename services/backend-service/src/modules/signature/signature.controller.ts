/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { SignDTO, VerifyDTO, ContractFileDTO, DataResponse } from './signature.dto';
import { SignatureService } from './signature.service';

@Controller('signatures')
@ApiTags('Signatures')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Post('sign')
  async signingContract(@Body() payload: Partial<SignDTO>): Promise<DataResponse> {
    return await this.signatureService.signing(payload);
  }

  @Post('verifyByFile')
  @UseInterceptors(FilesInterceptor('contract'))
  async verifyContract(
    @Req() contractFile: Partial<ContractFileDTO>,
    @Body() payload: Partial<VerifyDTO>,
  ): Promise<DataResponse> {
    return await this.signatureService.verifyByFile(contractFile, payload);
  }

  @Post('verifyByIdContract')
  async verifyByContractId(@Body() payload: Partial<VerifyDTO>): Promise<DataResponse> {
    return await this.signatureService.verifyByContractId(payload);
  }
}

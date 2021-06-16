/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Body, Controller, Get, Post, Query, Req, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { SignDTO, VerifyDTO, ContractFileDTO } from './signature.dto';
import { SignatureService } from './signature.service';

@Controller('signatures')
@ApiTags('Signatures')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Get()
  async generateKey() {
    await this.signatureService.createSignature();
  }

  @Post('sign')
  async signingContract(@Body() payload: SignDTO): Promise<boolean> {
    return await this.signatureService.signing(payload);
  }

  @Post('verify')
  @UseInterceptors(FilesInterceptor('contract'))
  async verifyContract(
    @Req() contractFile: ContractFileDTO,
    @Body() payload: VerifyDTO,
  ): Promise<boolean> {
    return await this.signatureService.verify(contractFile, payload);
  }
}

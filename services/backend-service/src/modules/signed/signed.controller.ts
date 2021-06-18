/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataResponse, SentDTO } from './signed.dto';
import { SignedService } from './signed.service';

@Controller('signeds')
@ApiTags('Signeds')
export class SignedController {
  constructor(private readonly signedService: SignedService) {}

  @Post()
  async sentContract(@Body() payload: SentDTO): Promise<DataResponse> {
    return await this.signedService.sentToPartner(payload);
  }
}

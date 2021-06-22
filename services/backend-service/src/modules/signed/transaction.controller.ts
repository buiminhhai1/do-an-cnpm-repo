/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataResponse, DestroyContract, ReturnDTO, SentDTO } from './transaction.dto';
import { TransactionService } from './transaction.service';

@Controller('transactions')
@ApiTags('Transactions')
export class TransactionController {
  constructor(private readonly signedService: TransactionService) {}

  @Post('sending')
  async sentContract(@Body() payload: SentDTO): Promise<DataResponse> {
    return await this.signedService.sentToPartner(payload);
  }

  @Post('receiving')
  async returnContract(@Body() payload: ReturnDTO): Promise<DataResponse> {
    return await this.signedService.returnToPartner(payload);
  }

  @Post('destroy')
  async destroyContract(@Body() payload: DestroyContract): Promise<DataResponse> {
    return await this.signedService.destroyContract(payload);
  }
}

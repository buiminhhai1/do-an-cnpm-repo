/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Inject, Injectable } from '@nestjs/common';
import { SentRepository, ReceivedRepository } from './signed.repository';
import { TenantAwareContext } from '@modules/database';
import { DataResponse, SentDTO } from './signed.dto';
import { GoogleStorageService } from '@modules/googlestorage';
import { UserService } from '@modules/user';
import { MailService } from '../../mail/mail.service';
import { ReceiverContractStatus, SentContractStatus, Status } from '@entities';

@Injectable()
export class SignedService {
  constructor(
    private readonly sentRepo: SentRepository,
    private readonly storeSevice: GoogleStorageService,
    private readonly userService: UserService,
    private readonly receivedRepo: ReceivedRepository,
    private readonly mailService: MailService,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}

  async sentToPartner(payload: Partial<SentDTO>): Promise<DataResponse> {
    const receiver = await this.userService.getUserRepo().findOne({ email: payload.email });
    if (receiver === undefined) {
      return { data: null, message: 'Email not exist!' };
    }
    const user = await this.userService.getUserRepo().findOne({ id: this.context.userId });
    let contract = await this.storeSevice
      .getContractRepo()
      .findOne({ contractId: payload.contractId });
    if (contract === undefined) {
      return { data: null, message: 'Contract not exist!' };
    }
    if (contract.status === Status.unsigned) {
      return { data: null, message: 'Contract unsigned!' };
    }
    contract = await this.storeSevice.getContractRepo().findOne({
      where: {
        contractId: payload.contractId,
      },
      relations: ['signature'],
    });
    await this.sentRepo.save(
      this.sentRepo.create({
        emailReceiver: payload.email,
        contract: contract,
        status: SentContractStatus.pending,
      }),
    );
    const contractReceived = await this.storeSevice.copyFile(contract.contractId, receiver.id);
    console.log(contractReceived);
    await this.receivedRepo.save(
      this.receivedRepo.create({
        emailSender: user.email,
        status: ReceiverContractStatus.pending,
        contract: contractReceived,
      }),
    );
    const fileOnStore = await this.storeSevice.getInfoOfFile(contractReceived.contractId);
    const link = fileOnStore.download;
    const data = {
      link: link,
      documentSign: contract.signature.signature,
      emailReciever: payload.email,
      nameReciever: receiver.lastName,
      subject: payload.subject,
    };
    await this.mailService.sendLink(data);
    return { data: { status: true }, message: 'Sent success!' };
  }
}

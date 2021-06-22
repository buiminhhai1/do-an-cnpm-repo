/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Inject, Injectable } from '@nestjs/common';
import { SentRepository, ReceivedRepository } from './transaction.repository';
import { TenantAwareContext } from '@modules/database';
import {
  DataResponse,
  DestroyContract,
  ReturnDTO,
  SentDTO,
  StatusContract,
} from './transaction.dto';
import { GoogleStorageService } from '@modules/googlestorage';
import { UserService } from '@modules/user';
import { MailService } from '../../mail/mail.service';
import { ReceiverContractStatus, SentContractStatus, Status, Type } from '@entities';
import { SignatureService } from '@modules/signature';
import { omit } from 'lodash';

@Injectable()
export class TransactionService {
  constructor(
    private readonly sentRepo: SentRepository,
    private readonly storeSevice: GoogleStorageService,
    private readonly userService: UserService,
    private readonly receivedRepo: ReceivedRepository,
    private readonly mailService: MailService,
    private readonly signatureService: SignatureService,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}

  async sentToPartner(payload: Partial<SentDTO>): Promise<DataResponse> {
    const receiver = await this.userService.getUserRepo().findOne({ email: payload.email });
    if (receiver === undefined) {
      return { data: null, message: 'Email not exist!' };
    }
    const user = await this.userService.getUserRepo().findOne({ id: this.context.userId });
    const sentInfo = await this.sentRepo.findOne({
      emailReceiver: payload.email,
      status: SentContractStatus.pending,
    });
    if (sentInfo !== undefined) {
      return { data: null, message: `You have had a transaction pending with ${payload.email}!` };
    }
    let contract = await this.storeSevice
      .getContractRepo()
      .findOne({ contractId: payload.contractId });
    if (contract === undefined) {
      return { data: null, message: 'Contract not exist!' };
    }
    if (contract.status === Status.unsigned) {
      return { data: null, message: 'Contract unsigned!' };
    }
    if (contract.type === Type.sender) {
      return { data: null, message: 'Contract sent!' };
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
        subject: payload.subject,
      }),
    );
    contract.type = Type.sender;
    await this.storeSevice
      .getContractRepo()
      .update({ contractId: payload.contractId }, omit(contract, 'signature'));
    const contractReceived = await this.storeSevice.copyFile(contract.contractId, receiver.id);
    await this.receivedRepo.save(
      this.receivedRepo.create({
        emailSender: user.email,
        status: ReceiverContractStatus.pending,
        contract: contractReceived,
        subject: payload.subject,
        signature: contract.signature.signature,
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

  async returnToPartner(payload: Partial<ReturnDTO>): Promise<DataResponse> {
    const sender = await this.userService.getUserRepo().findOne({ email: payload.email });
    if (sender === undefined) {
      return { data: null, message: 'Email not exist!' };
    }
    const user = await this.userService.getUserRepo().findOne({ id: this.context.userId });
    let contract = await this.storeSevice
      .getContractRepo()
      .findOne({ contractId: payload.contractId });
    if (contract === undefined) {
      return { data: null, message: 'Contract not exist!' };
    }
    if (payload.status === StatusContract.sign && contract.status === Status.unsigned) {
      return { data: null, message: 'Contract unsigned!' };
    }
    contract = await this.storeSevice.getContractRepo().findOne({
      where: {
        contractId: payload.contractId,
      },
      relations: ['signature'],
    });
    const sentInfo = await this.sentRepo.findOne({
      where: { emailReceiver: user.email, status: SentContractStatus.pending },
      relations: ['contract'],
    });

    const receivedInfo = await this.receivedRepo.findOne({
      where: { emailSender: payload.email, status: ReceiverContractStatus.pending },
      relations: ['contract'],
    });

    if (payload.status === StatusContract.sign) {
      sentInfo.status = SentContractStatus.signed;
      sentInfo.signature = contract.signature.signature;
      receivedInfo.status = ReceiverContractStatus.signed;
      const buffer = await this.signatureService.getBufferFile(contract.contractId);
      await this.storeSevice.updateContract(
        {
          files: [
            {
              mimetype: 'application/pdf',
              originalname: contract.contractName,
              buffer: buffer,
            },
          ],
        },
        { contractId: sentInfo.contract.contractId },
      );
      await this.sentRepo.update(
        { emailReceiver: user.email, status: SentContractStatus.pending },
        sentInfo,
      );
      await this.receivedRepo.update(
        { emailSender: payload.email, status: ReceiverContractStatus.pending },
        receivedInfo,
      );
      const fileOnStore = await this.storeSevice.getInfoOfFile(contract.contractId);
      const link = fileOnStore.download;
      const data = {
        link: link,
        documentSign: contract.signature.signature,
        emailReciever: payload.email,
        nameReciever: sender.lastName,
        subject: sentInfo.subject,
      };
      await this.mailService.sendLink(data);
      return { data: { status: true }, message: 'Sent success!' };
    } else {
      sentInfo.status = SentContractStatus.destroyed;
      receivedInfo.status = ReceiverContractStatus.destroyed;
      await this.sentRepo.update(
        { emailReceiver: user.email, status: SentContractStatus.pending },
        sentInfo,
      );
      await this.receivedRepo.update(
        { emailSender: payload.email, status: ReceiverContractStatus.pending },
        receivedInfo,
      );
      const data = {
        link: '',
        documentSign: null,
        emailReciever: payload.email,
        nameReciever: sender.lastName,
        subject: sentInfo.subject,
      };
      await this.mailService.sendLink(data);
      return { data: { status: true }, message: 'The contract has been destroy success!' };
    }
  }

  async destroyContract(payload: Partial<DestroyContract>): Promise<DataResponse> {
    const sender = await this.userService.getUserRepo().findOne({ email: payload.email });
    if (sender === undefined) {
      return { data: null, message: 'Email not exist!' };
    }
    const user = await this.userService.getUserRepo().findOne({ id: this.context.userId });
    const sentInfo = await this.sentRepo.findOne({
      where: { emailReceiver: payload.email, status: SentContractStatus.pending },
      relations: ['contract'],
    });
    if (sentInfo === undefined) {
      return { data: null, message: 'The Contract can not be destroy!' };
    }
    const receivedInfo = await this.receivedRepo.findOne({
      where: { emailSender: user.email, status: ReceiverContractStatus.pending },
      relations: ['contract'],
    });
    sentInfo.status = SentContractStatus.destroyed;
    receivedInfo.status = ReceiverContractStatus.destroyed;
    await this.sentRepo.update(
      { emailReceiver: payload.email, status: SentContractStatus.pending },
      sentInfo,
    );
    await this.receivedRepo.update(
      { emailSender: user.email, status: ReceiverContractStatus.pending },
      receivedInfo,
    );
    const data = {
      link: '',
      documentSign: null,
      emailReciever: payload.email,
      nameReciever: sender.lastName,
      subject: sentInfo.subject,
    };
    await this.mailService.sendLink(data);
    return { data: { status: true }, message: 'The contract has been destroy success!' };
  }
}

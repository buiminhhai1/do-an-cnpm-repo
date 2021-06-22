import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailPayloadDto } from './mail.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendLink(payload: MailPayloadDto): Promise<void> {
    await this.mailerService.sendMail({
      to: payload.emailReciever,
      subject: payload.subject,
      template: payload.documentSign !== null ? './getdocument' : './destroycontract',
      context: {
        name: payload.nameReciever,
        url: payload.link,
        sign: payload.documentSign,
      },
    });
  }
}

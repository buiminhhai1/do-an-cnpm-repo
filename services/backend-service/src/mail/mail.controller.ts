import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async testMail(): Promise<void> {
    await this.mailService.sendLink({
      emailReciever: 'nguyenhoanganh806@gmail.com',
      link: 'sdf',
      nameReciever: 'asdf',
      subject: 'asdf',
      documentSign: 'asdf',
    });
  }
}

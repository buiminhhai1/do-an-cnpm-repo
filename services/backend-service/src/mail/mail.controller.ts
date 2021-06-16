import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async sendMailSample(): Promise<void> {
    return this.mailService.sendUserConfiguration('1234');
  }
}

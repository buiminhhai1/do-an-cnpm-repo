import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfiguration(token: string): Promise<void> {
    const url = `http://localhost:8000/auth/confirm?token=${token}`;
    await this.mailerService.sendMail({
      to: 'haibui.dev.1996@gmail.com',
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation',
      context: {
        name: 'haibui',
        url,
      },
    });
  }
}

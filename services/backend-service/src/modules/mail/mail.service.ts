import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@entities';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {
  }

  async sendEmail(user: Partial<UserEntity>) {
    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'noreply@nestjs.com',
        subject: 'Testing Nest MailerModule ✔',
        template: __dirname + '/templates/confirmation',
        context: {
          name: user.firstName + ' ' + user.lastName,
          url: 'http://localhost:3000/home'
        },
      })
      .then((success) => {
        console.log(success)
      })
      .catch((err) => {
        console.log(err)
      });
  }
}

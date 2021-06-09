import { Module } from '@nestjs/common';
import { scanComponents } from '@common';
import { UserModule } from '@modules/user';
import { MailModule } from './../mail/mail.module';
import * as services from './auth.service';
import * as controllers from './auth.controller';
import * as guards from './admin.guard';

@Module({
  imports: [UserModule, MailModule],
  providers: [...scanComponents(services), ...scanComponents(guards)],
  controllers: [...scanComponents(controllers)],
  exports: [...scanComponents(services), ...scanComponents(guards)],
})
export class AuthModule {}

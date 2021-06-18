import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scanComponents, scanEntities } from '@common';
import * as repositories from './signed.repository';
import { SignedService } from './signed.service';
import * as controllers from './signed.controller';
import { UserModule } from '@modules/user';
import { GoogleStorageModule } from '@modules/googlestorage';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([...scanEntities(repositories)]),
    UserModule,
    GoogleStorageModule,
    MailModule,
  ],
  providers: [SignedService],
  controllers: [...scanComponents(controllers)],
  exports: [SignedService],
})
export class SignedModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scanComponents, scanEntities } from '@common';
import * as repositories from './transaction.repository';
import { TransactionService } from './transaction.service';
import * as controllers from './transaction.controller';
import { UserModule } from '@modules/user';
import { GoogleStorageModule } from '@modules/googlestorage';
import { MailModule } from '../../mail/mail.module';
import { SignatureModule } from '@modules/signature';

@Module({
  imports: [
    TypeOrmModule.forFeature([...scanEntities(repositories)]),
    UserModule,
    GoogleStorageModule,
    MailModule,
    SignatureModule,
  ],
  providers: [TransactionService],
  controllers: [...scanComponents(controllers)],
  exports: [TransactionService],
})
export class TransactionModule {}

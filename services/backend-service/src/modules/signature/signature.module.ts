import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scanComponents, scanEntities } from '@common';
import * as repositories from './signature.repository';
import { SignatureService } from './signature.service';
import * as controllers from './signature.controller';
import { UserModule } from '@modules/user';
import { GoogleStorageModule } from '@modules/googlestorage';

@Module({
  imports: [
    TypeOrmModule.forFeature([...scanEntities(repositories)]),
    UserModule,
    GoogleStorageModule,
  ],
  providers: [SignatureService],
  controllers: [...scanComponents(controllers)],
  exports: [SignatureService],
})
export class SignatureModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scanComponents, scanEntities } from '@common';
import { DatabaseModule } from '@modules/database';
import * as repositories from './googlestorage.repository';
import * as controllers from './googlestorage.controller';
import { GoogleStorageService } from './googlestorage.service';

@Module({
  imports: [TypeOrmModule.forFeature([...scanEntities(repositories)]), DatabaseModule],
  providers: [GoogleStorageService],
  controllers: [...scanComponents(controllers)],
  exports: [GoogleStorageService],
})
export class GoogleStorageModule {}

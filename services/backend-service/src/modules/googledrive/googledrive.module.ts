import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scanComponents, scanEntities } from '@common';
import { DatabaseModule } from '@modules/database';
import * as repositories from './googledrive.repository';
import * as controllers from './googledrive.controller';
import { GoogleDriveService } from './googledrive.service';

@Module({
  imports: [TypeOrmModule.forFeature([...scanEntities(repositories)]), DatabaseModule],
  providers: [GoogleDriveService],
  controllers: [...scanComponents(controllers)],
})
export class GoogleDriveModule {}

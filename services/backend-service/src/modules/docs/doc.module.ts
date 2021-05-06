import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scanComponents, scanEntities } from '@common';
import { DatabaseModule } from '@modules/database';
import * as repositories from './doc.repository';
import * as controllers from './doc.controller';
import { DocumentService } from './doc.service';

@Module({
  imports: [TypeOrmModule.forFeature([...scanEntities(repositories)]), DatabaseModule],
  providers: [DocumentService],
  controllers: [...scanComponents(controllers)],
})
export class DocumentModule {}

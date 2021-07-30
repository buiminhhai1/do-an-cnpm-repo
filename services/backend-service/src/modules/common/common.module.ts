import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scanComponents, scanEntities } from '@common';
import { DatabaseModule } from '@modules/database';
import * as repositories from './common.repository';
import * as controllers from './common.controller';
import { CommonService } from './common.service';

@Module({
  imports: [TypeOrmModule.forFeature([...scanEntities(repositories)]), DatabaseModule],
  providers: [CommonService],
  controllers: [...scanComponents(controllers)],
})
export class CommonModule {}

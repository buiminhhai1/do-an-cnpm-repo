import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scanComponents, scanEntities } from '@common';
import { DatabaseModule } from '@modules/database';
import * as repositories from './user.repository';
import * as controllers from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([...scanEntities(repositories)]), DatabaseModule],
  providers: [UserService],
  controllers: [...scanComponents(controllers)],
  exports: [UserService],
})
export class UserModule {}

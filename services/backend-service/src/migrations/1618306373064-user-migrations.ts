import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '@entities';

export class userMigrations1618306373064 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('password', 10);
    await queryRunner.manager.insert(UserEntity, {
      id: '0afe6a7d-0f27-4a57-aca7-f2075ae2fde5',
      firstName: 'admin',
      lastName: 'admin',
      username: 'admin',
      password,
      email: 'admin@admin.com',
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(UserEntity, {});
  }
}

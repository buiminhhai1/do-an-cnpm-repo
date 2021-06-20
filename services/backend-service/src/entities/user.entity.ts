import { BaseEntity } from './base';
import { Column, Entity, OneToOne, Unique } from 'typeorm';
import { GoogleStorageEntity } from './googlestorage.entity';
import { KeyEntity } from './key.entity';

export enum UserRole {
  admin = 'admin',
  user = 'user',
}

@Entity()
export class UserEntity extends BaseEntity {
  @Column()
  @Unique(['username'])
  public username: string;

  @Column()
  public password: string;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  @Column()
  public email: string;

  @Column({ nullable: true })
  public phoneNumber: string;

  @Column({ nullable: true })
  public address: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.user,
  })
  public role: UserRole;

  @OneToOne(() => GoogleStorageEntity, (store) => store.user)
  public store: GoogleStorageEntity;

  @OneToOne(() => KeyEntity, (key) => key.user)
  public key: KeyEntity;
}

import { BaseEntity } from './base';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { DocumentEntity } from './document.entity';

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

  @OneToMany(() => DocumentEntity, (document) => document.user)
  public documents: DocumentEntity[];
}

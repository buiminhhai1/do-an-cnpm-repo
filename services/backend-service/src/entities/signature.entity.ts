import { BaseEntity } from './base';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class SignatureEntity extends BaseEntity {
  @Column()
  public privateKeyId: string;

  @Column()
  public publicKeyId: string;

  @OneToOne(() => UserEntity, (user) => user.sign, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public user: UserEntity;
}

import { BaseEntity } from '@entities';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ContractEntity } from './contract.entity';
import { UserEntity } from './user.entity';

@Entity()
export class GoogleStorageEntity extends BaseEntity {
  @Column()
  storeId: string;

  @Column()
  storeName: string;

  @OneToMany(() => ContractEntity, (contract) => contract.store)
  contracts: ContractEntity[];

  @OneToOne(() => UserEntity, (user) => user.store, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
}

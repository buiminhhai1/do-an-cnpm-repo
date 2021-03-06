import { BaseEntity } from './base';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { ContractEntity } from './contract.entity';

@Entity()
export class SignatureEntity extends BaseEntity {
  @Column()
  public signature: string;

  @OneToOne(() => ContractEntity, (contract) => contract.signature, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public contract: ContractEntity;
}

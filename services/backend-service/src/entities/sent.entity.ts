import { BaseEntity } from './base';
import { Entity, Column, ManyToOne } from 'typeorm';
import { ContractEntity } from './contract.entity';

export enum SentContractStatus {
  pending = 'pending',
  signed = 'signed',
  destroyed = 'destroyed',
}

@Entity()
export class SentEntity extends BaseEntity {
  @Column()
  public emailReceiver: string;

  @Column({
    type: 'enum',
    enum: SentContractStatus,
    default: SentContractStatus.pending,
  })
  public status: SentContractStatus;

  @ManyToOne(() => ContractEntity, (contract) => contract.signature, {
    eager: false,
    onDelete: 'CASCADE',
  })
  contract: ContractEntity;
}

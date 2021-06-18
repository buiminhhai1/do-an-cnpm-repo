import { BaseEntity } from './base';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { ContractEntity } from './contract.entity';

export enum ReceiverContractStatus {
  pending = 'pending',
  signed = 'signed',
  destroyed = 'destroyed',
}

@Entity()
export class ReceivedEntity extends BaseEntity {
  @Column()
  public emailSender: string;

  @Column({
    type: 'enum',
    enum: ReceiverContractStatus,
    default: ReceiverContractStatus.pending,
  })
  public status: ReceiverContractStatus;

  @OneToOne(() => ContractEntity, (contract) => contract.recived, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  contract: ContractEntity;
}

import { BaseEntity } from './base';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
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

  @Column({ nullable: true })
  public signature: string;

  @Column()
  public subject: string;

  @Column({
    type: 'enum',
    enum: SentContractStatus,
    default: SentContractStatus.pending,
  })
  public status: SentContractStatus;

  @OneToOne(() => ContractEntity, (contract) => contract.sent, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  contract: ContractEntity;
}

import { BaseEntity } from './base';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { GoogleStorageEntity } from './googlestorage.entity';
import { SignatureEntity } from './signature.entity';
import { SentEntity } from './sent.entity';
import { ReceivedEntity } from './received.entity';

export enum Status {
  signed = 'signed',
  unsigned = 'unsigned',
}

export enum Type {
  owner = 'owner',
  receiver = 'receiver',
  sender = 'sender',
}

@Entity()
export class ContractEntity extends BaseEntity {
  @Column()
  public contractId: string;

  @Column()
  public contractName: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.unsigned,
  })
  public status: Status;

  @Column({
    type: 'enum',
    enum: Type,
    default: Type.owner,
  })
  public type: Type;

  @ManyToOne(() => GoogleStorageEntity, (store) => store.contracts, {
    eager: false,
    onDelete: 'CASCADE',
  })
  public store: GoogleStorageEntity;

  @OneToOne(() => SignatureEntity, (signature) => signature.contract)
  public signature: SignatureEntity;

  @OneToOne(() => SentEntity, (sent) => sent.contract)
  public sent: SentEntity;

  @OneToOne(() => ReceivedEntity, (recived) => recived.contract)
  public recived: ReceivedEntity;
}

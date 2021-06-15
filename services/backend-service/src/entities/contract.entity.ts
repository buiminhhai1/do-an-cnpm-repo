import { BaseEntity } from './base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { GoogleStorageEntity } from './googlestorage.entity';

export enum Status {
  signed = 'signed',
  unsigned = 'unsigned',
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
  @Column()
  public status: Status;

  @ManyToOne(() => GoogleStorageEntity, (store) => store.contract, {
    eager: false,
    onDelete: 'CASCADE',
  })
  public store: GoogleStorageEntity;
}

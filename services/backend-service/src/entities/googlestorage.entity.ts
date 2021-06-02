import { BaseEntity } from '@entities';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class GoogleStorageEntity extends BaseEntity {
  @Column()
  folderId: string;

  @ManyToOne(() => UserEntity, (user) => user.documents, { eager: false, onDelete: 'CASCADE' })
  user: UserEntity;
}

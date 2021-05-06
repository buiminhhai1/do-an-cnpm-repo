import { BaseEntity } from '@entities';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class DocumentEntity extends BaseEntity {
  @Column()
  fileID: string;

  @ManyToOne(() => UserEntity, (user) => user.documents, { eager: false, onDelete: 'CASCADE' })
  user: UserEntity;
}

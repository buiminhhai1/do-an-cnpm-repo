import { ObjectID } from 'mongodb';
import { BaseEntity } from '../entities/base-entity';

export class BaseDto {
  id: string | ObjectID;
  createdAt: Date | string;
  updatedAt: Date | string;

  constructor(entity: BaseEntity) {
    this.id = entity.id;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

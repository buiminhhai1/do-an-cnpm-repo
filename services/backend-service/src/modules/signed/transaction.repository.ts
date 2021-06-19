import { EntityRepository, Repository } from 'typeorm';
import { SentEntity, ReceivedEntity } from '@entities';

@EntityRepository(SentEntity)
export class SentRepository extends Repository<SentEntity> {}

@EntityRepository(ReceivedEntity)
export class ReceivedRepository extends Repository<ReceivedEntity> {}

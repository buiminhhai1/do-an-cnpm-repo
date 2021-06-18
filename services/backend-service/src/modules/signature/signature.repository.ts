import { EntityRepository, Repository } from 'typeorm';
import { KeyEntity, SignatureEntity } from '@entities';

@EntityRepository(KeyEntity)
export class KeyRepository extends Repository<KeyEntity> {}

@EntityRepository(SignatureEntity)
export class SignatureRepository extends Repository<SignatureEntity> {}

import { EntityRepository, Repository } from 'typeorm';
import { SignatureEntity, SignContractEntity } from '@entities';

@EntityRepository(SignatureEntity)
export class SignatureRepository extends Repository<SignatureEntity> {}

@EntityRepository(SignContractEntity)
export class SignContractRepository extends Repository<SignContractEntity> {}

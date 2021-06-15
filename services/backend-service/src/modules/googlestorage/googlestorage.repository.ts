import { EntityRepository, Repository } from 'typeorm';
import { ContractEntity, GoogleStorageEntity } from '@entities';

@EntityRepository(GoogleStorageEntity)
export class GoogleStorageRepository extends Repository<GoogleStorageEntity> {}

@EntityRepository(ContractEntity)
export class ContractRepository extends Repository<ContractEntity> {}

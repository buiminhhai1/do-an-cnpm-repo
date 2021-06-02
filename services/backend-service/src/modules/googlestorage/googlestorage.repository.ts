import { GoogleStorageEntity } from 'src/entities/googlestorage.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(GoogleStorageEntity)
export class GoogleStorageRepository extends Repository<GoogleStorageEntity> {}

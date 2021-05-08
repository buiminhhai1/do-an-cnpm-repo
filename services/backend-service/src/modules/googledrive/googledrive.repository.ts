import { GoogleDriveEntity } from 'src/entities/googledrive.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(GoogleDriveEntity)
export class GoogleDriveRepository extends Repository<GoogleDriveEntity> {}

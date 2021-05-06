import { DocumentEntity } from 'src/entities/document.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(DocumentEntity)
export class DocumentRepository extends Repository<DocumentEntity> {}

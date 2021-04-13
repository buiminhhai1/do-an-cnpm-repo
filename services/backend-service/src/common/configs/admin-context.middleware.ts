import { ForbiddenException, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { UserRole } from '../../entities';
import { CustomHttpRequest } from '../interfaces';

@Injectable()
export class AdminContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AdminContextMiddleware.name);

  use(req: CustomHttpRequest, res: Response, next: () => void): void {
    if (req.role !== UserRole.admin) {
      throw new ForbiddenException('Access defined');
    }
    next();
  }
}

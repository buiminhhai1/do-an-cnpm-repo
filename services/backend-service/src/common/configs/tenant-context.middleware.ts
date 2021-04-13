import { CustomHttpRequest } from './../interfaces/common';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { devTenant } from '../constants';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  use(req: CustomHttpRequest, res: Response, next: () => void): void {
    this.logger.log('- Inject devtenant to context');
    req.tenantId = devTenant;
    next();
  }
}

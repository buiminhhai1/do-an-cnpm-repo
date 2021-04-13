import { Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CustomHttpRequest } from '@common';

const logger = new Logger('TenantAwareContextProvider');

class ContextCredential {
  id: string;
  tenantId: any;
}

export class TenantAwareContext {
  constructor(private readonly credential: ContextCredential) {}

  get userId(): string {
    return this.credential.id;
  }

  get tenantId(): any {
    return this.credential.tenantId;
  }
}

export const TenantAwareContextProvider = {
  provide: TenantAwareContext,
  useFactory: async (httpRequest: CustomHttpRequest) => {
    // Handle request from HTTP
    logger.warn(' - Go to context provider');
    if (httpRequest?.tenantId) {
      logger.log(` - Context request from HTTP: TenantId: ${httpRequest.tenantId}`);
      return new TenantAwareContext({
        id: httpRequest.id,
        tenantId: httpRequest.tenantId,
      });
    }

    logger.log(' - Context request from HTTP without tenantID');
    return null;
  },
  inject: [REQUEST],
  scope: Scope.REQUEST,
};

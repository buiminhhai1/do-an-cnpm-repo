import { Injectable } from '@nestjs/common';
import {
  TerminusEndpoint,
  TerminusModuleOptions,
  TerminusOptionsFactory,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Injectable()
export class HealthConfigService implements TerminusOptionsFactory {
  constructor(private readonly typeorm: TypeOrmHealthIndicator) {}

  createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      url: '/health',
      healthIndicators: [async () => this.typeorm.pingCheck('system')],
    };
    return {
      endpoints: [healthEndpoint],
    };
  }
}

import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseCoreModule } from './database-core.module';
import { TenantAwareContext, TenantAwareContextProvider } from './providers';
import { TypeOrmConfigService } from './services';
import { TenantMigrationService } from './services/tenant-migration.service';

export class DatabaseModule {
  static async register(): Promise<DynamicModule> {
    return {
      module: DatabaseCoreModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useExisting: TypeOrmConfigService,
        }),
      ],
      providers: [TenantAwareContextProvider, TenantMigrationService, TypeOrmConfigService],
      exports: [TenantAwareContext, TypeOrmConfigService],
      global: true,
    };
  }
}

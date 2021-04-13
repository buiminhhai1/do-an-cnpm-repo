import { Logger, OnModuleInit } from '@nestjs/common';
import { getConnectionManager } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { databaseOptions, devTenant } from '@common';

const logger = new Logger('DatabaseModuleCore');

export class DatabaseCoreModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    logger.log('go to database core module init');
    // create default connection for migration scripts
    const connectionManager = getConnectionManager();
    if (!connectionManager.has('system')) {
      logger.log(' - Setting up system database connection...');
      logger.log(JSON.stringify(databaseOptions));
      const connection = connectionManager.create({
        ...databaseOptions,
        name: 'system',
      });
      await connection.connect();
    }

    // Setup default tenant database in development local: Sync schema
    if (!connectionManager.has(devTenant)) {
      logger.log(`- Setting up dev tenant databse for tenantId: ${devTenant}`);

      const systemQueryRunner = connectionManager.get('system').createQueryRunner();
      const isHaveTenantSchema = await systemQueryRunner.hasSchema(devTenant);

      if (!isHaveTenantSchema) {
        logger.log(`- Creating schema for tenantId: ${devTenant}`);
        await systemQueryRunner.createSchema(devTenant);
      }

      const connection = connectionManager.create(<PostgresConnectionOptions>{
        ...databaseOptions,
        name: devTenant,
        schema: devTenant,
      });

      logger.log(`Migrations ${process.cwd()}/dist/migrations/**/*.js`);
      await connection.connect();
      logger.log(`Running migration for tentantId: ${devTenant}`);
      const migrations = await connection.runMigrations();
      logger.log(migrations);
      logger.log(`- Database migration done for tenantId: ${devTenant}`);
    }
  }
}

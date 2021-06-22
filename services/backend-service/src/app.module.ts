import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware, JWTConfigurationProvider, TenantContextMiddleware } from '@common';
import { AuthModule, AuthService } from '@modules/auth';

import { DatabaseModule } from './modules/database';
import { GoogleStorageModule } from '@modules/googlestorage/googlestorage.module';
import { CommonModule } from '@modules/common';

@Module({
  imports: [
    DatabaseModule.register(),
    {
      ...JwtModule.registerAsync(JWTConfigurationProvider),
      global: true,
    },
    AuthModule,
    GoogleStorageModule,
    CommonModule
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer {
    return consumer
      .apply(TenantContextMiddleware)
      .forRoutes('*')
      .apply(AuthMiddleware)
      .exclude('/swagger', '/health', '/auth/register', '/auth/login', '/common/profile-image', {
        path: '/authors',
        method: RequestMethod.GET,
      })
      .forRoutes('*')
      .apply(TenantContextMiddleware)
      .forRoutes(
        '/auth/admin',
        '/google_storage/contracts',
        '/google_storage/contracts/signle_contract',
      );
  }
}

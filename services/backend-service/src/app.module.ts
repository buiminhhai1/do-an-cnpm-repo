import { AuthMiddleware, JWTConfigurationProvider, TenantContextMiddleware } from '@common';
import { AuthModule, AuthService } from '@modules/auth';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from './modules/database';

@Module({
  imports: [
    DatabaseModule.register(),

    {
      ...JwtModule.registerAsync(JWTConfigurationProvider),
      global: true,
    },
    AuthModule,
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
      .exclude('/swagger', '/health', '/auth/register', '/auth/login', {
        path: '/authors',
        method: RequestMethod.GET,
      })
      .forRoutes('*')
      .apply(TenantContextMiddleware)
      .forRoutes('/auth/admin');
  }
}

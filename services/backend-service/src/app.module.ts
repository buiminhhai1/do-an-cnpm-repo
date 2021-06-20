import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware, JWTConfigurationProvider, TenantContextMiddleware } from '@common';
import { AuthModule, AuthService } from '@modules/auth';

import { DatabaseModule } from './modules/database';
import { GoogleStorageModule } from '@modules/googlestorage';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { SignatureModule } from '@modules/signature';
import { TransactionModule } from '@modules/signed';

@Module({
  imports: [
    DatabaseModule.register(),
    {
      ...JwtModule.registerAsync(JWTConfigurationProvider),
      global: true,
    },
    AuthModule,
    GoogleStorageModule,
    MailModule,
    SignatureModule,
    TransactionModule,
  ],
  providers: [AuthService, MailService],
  exports: [AuthService, MailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer {
    return consumer
      .apply(TenantContextMiddleware)
      .forRoutes('*')
      .apply(AuthMiddleware)
      .exclude('/swagger', '/health', '/auth/register', '/auth/login', '/mail', {
        path: '/authors',
        method: RequestMethod.GET,
      })
      .forRoutes('*')
      .apply(TenantContextMiddleware)
      .forRoutes(
        '/auth/admin',
        // Store and contract
        '/google_storage/contracts',
        '/google_storage/contracts/signle_contract',
        // Signature
        './signatures/sign',
        './signatures/verifyByFile',
        './signatures/verifyByIdContract',
        // Transactionsss
        './transactions/sending',
        './transactions/receiving',
      );
  }
}

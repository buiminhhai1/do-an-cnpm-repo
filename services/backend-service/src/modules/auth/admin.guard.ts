import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '@entities';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.vaiTro === UserRole.admin) {
      return true;
    }
    return false;
  }
}

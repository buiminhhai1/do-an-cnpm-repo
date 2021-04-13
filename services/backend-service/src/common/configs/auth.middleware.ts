import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '@entities';
import { CustomHttpRequest } from '../interfaces';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  private readonly logger = new Logger(AuthMiddleware.name);

  async use(req: CustomHttpRequest, res: Response, next: () => void): Promise<void> {
    const authorizationHeader = <string>req.headers['authorization'] || '';
    if (authorizationHeader) {
      try {
        this.logger.log('- Got header authorization');
        this.logger.log(authorizationHeader);
        const jwts = authorizationHeader.split(' ');
        if (jwts.length === 2) {
          const user: Partial<UserEntity> = await this.jwtService.verifyAsync(jwts[1]);
          req.id = user.id;
          req.username = user.username;
          req.role = user.role;
        }
      } catch (e) {
        this.logger.error(JSON.stringify(e, null, 2));
      }
    } else {
      throw new UnauthorizedException('Token invalid');
    }
    next();
  }
}

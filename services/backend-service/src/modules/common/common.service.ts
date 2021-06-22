import {
    ConflictException,
    Inject,
    Injectable,
    Logger,
    UnauthorizedException,
  } from '@nestjs/common';
import { omit } from 'lodash';
import * as bcrypt from 'bcrypt';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common';
import { UserEntity } from '@entities';
import {GetProfileImageDTO} from './common.dto';
import { UserRepository } from '@modules/user/user.repository';
@Injectable()
export class CommonService {
    constructor(
        private readonly userRepo: UserRepository,
    ) {}
    async getUserById(id: string): Promise<Partial<UserEntity>> {
        return this.userRepo.findOneOrFail(id);
    }
}
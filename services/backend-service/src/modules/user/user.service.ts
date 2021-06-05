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
import { TenantAwareContext } from '@modules/database';
import { CredentialDTO, GenericUserResponse, LoginDTO, PaginationAuthDTO } from '@modules/auth';

import { UserRepository } from './user.repository';
import {ChangeUserInfoDTO} from './user.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}
  private readonly logger = new Logger(UserService.name);

  async register(payload: CredentialDTO): Promise<Partial<UserEntity>> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where('user.username = :username', { username: payload.username })
      .getOne();
    if (user) {
      throw new ConflictException(`Username ${payload.username} already exist!`);
    }
    const password = await bcrypt.hash(payload.password, 10);
    const newUser = await this.userRepo.save(this.userRepo.create({ ...payload, password }));
    return omit(newUser, 'password');
  }

  async veriffyUser(payload: LoginDTO): Promise<Partial<UserEntity>> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where('user.username = :username', { username: payload.username })
      .getOne();
    if (!user) {
      throw new UnauthorizedException(`username: ${payload.username} not found`);
    }

    const isLogin = await bcrypt.compare(payload.password, user.password);
    if (isLogin) {
      return omit(user, 'password');
    }
    return null;
  }

  async getUsers(payload: PaginationAuthDTO): Promise<GenericUserResponse> {
    const pageSize = +payload.limit || DEFAULT_LIMIT;
    const pageNumber = +payload.page || DEFAULT_PAGE;
    const res = await this.userRepo
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'ASC')
      .take(pageSize)
      .skip(pageSize * (pageNumber - 1))
      .getManyAndCount();
    const data = res[0].map((item) => omit(item, 'password'));
    const next = pageSize * pageNumber < res[1] ? pageNumber + 1 : -1;
    return { data, total: res[1], next };
  }

  async getUserById(id: string): Promise<Partial<UserEntity>> {
    return this.userRepo.findOneOrFail(id);
  }

  async changePassword(updatePassword: string): Promise<void> {
    const user = await this.getUserById(this.context.userId);
    user.password = await bcrypt.hash(updatePassword, 10);
    await this.userRepo.save(user);
  }

  getUserRepo(): UserRepository {
    return this.userRepo;
  async changeUserInfo(updatedUserInfo: ChangeUserInfoDTO):Promise<void>{
    const user = await this.getUserById(this.context.userId);
    // console.log(updatedUserInfo)
    // console.log(user);
    user.firstName = updatedUserInfo.firstName;
    user.lastName = updatedUserInfo.lastName;
    user.email = updatedUserInfo.email;
    user.phoneNumber = updatedUserInfo.phoneNumber;
    user.address = updatedUserInfo.address;
    await this.userRepo.save(user);
  }
}

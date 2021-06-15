import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [UserController],
      providers: [UserService],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('should to definded', () => {
    expect(controller).toBeDefined();
  });
});

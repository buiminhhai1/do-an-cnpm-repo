import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule, TenantAwareContext } from '../database';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  const mockUserDetail = {
    username: 'mockuser',
    firstName: 'mock',
    lastName: 'user',
    email: 'mock@user.com',
    phoneNumber: '0123456789',
    address: 'dummy address',
    role: 'user',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserDetail: jest.fn().mockResolvedValue(mockUserDetail),
            getUserById: jest.fn().mockImplementation((id: string) => mockUserDetail),
          },
        },
        {
          provide: TenantAwareContext,
          useValue: {
            get userId(): string {
              return 'dummy-id';
            },
            get tenantId(): string {
              return 'dummy-tenant';
            },
          },
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('should to definded', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserDetail', () => {
    it('should return user detail', async () => {
      const userDetail = await controller.getUserDetail();
      expect(userDetail).toEqual(mockUserDetail);
      expect(userDetail.password).toBeUndefined();
    });
  });
});

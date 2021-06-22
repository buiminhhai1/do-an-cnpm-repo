import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule, TenantAwareContext } from '../database';
import { UserController } from './user.controller';
import { UserService } from './user.service';
const testUser = {
  username: "string",
  firstName: "string",
  lastName: "string",
  email: "string@gmail.com",
  phoneNumber: "string",
  address: "string",
  role: "admin",
  id: "b7cccdf0-7a9d-42bd-9b86-f0a54bdfc9ea",
  createdAt: "2021-06-21T00:33:03.847Z",
  updatedAt: "2021-06-21T00:33:03.847Z",
  version: 1
};
const testToken ={
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI3Y2NjZGYwLTdhOWQtNDJiZC05Yjg2LWYwYTU0YmRmYzllYSIsImNyZWF0ZWRBdCI6IjIwMjEtMDYtMjFUMDA6MzM6MDMuODQ3WiIsInVwZGF0ZWRBdCI6IjIwMjEtMDYtMjFUMDA6MzM6MDMuODQ3WiIsInZlcnNpb24iOjEsInVzZXJuYW1lIjoic3RyaW5nIiwiZmlyc3ROYW1lIjoic3RyaW5nIiwibGFzdE5hbWUiOiJzdHJpbmciLCJlbWFpbCI6InN0cmluZ0BnbWFpbC5jb20iLCJwaG9uZU51bWJlciI6InN0cmluZyIsImFkZHJlc3MiOiJzdHJpbmciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MjQyNjE5MTAsImV4cCI6MTYzNzIyMTkxMH0.eMBqe02sRUOVTGDhtBihKUt8tTfSprbgyb_lk32zgeo"
}
const users = {
  data:{
    id: "b7cccdf0-7a9d-42bd-9b86-f0a54bdfc9ea",
    username: "string",
    firstName: "string",
    lastName: "string",
    email: "string@gmail.com",
    phoneNumber: "string",
    address: "string",
    role: "admin",
    createdAt: "2021-06-21T00:33:03.847Z",
    updatedAt: "2021-06-21T00:33:03.847Z",
    version: 1
  },
  total: 1,
  next: -1
}
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

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '@modules/user';
import { UserRole } from '@entities';
import { CredentialDTO, GenericUserResponse, LoginDTO, PaginationAuthDTO } from '@modules/auth';

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
describe('Auth Controller', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue:{
            login: jest.fn().mockImplementation((payload: LoginDTO)=>Promise.resolve(testToken)),
          }
        },
        {
          provide: UserService,
          useValue:{
            veriffyUser: jest.fn().mockImplementation((payload: CredentialDTO)=>Promise.resolve(testUser)),
            register: jest.fn().mockImplementation((payload: CredentialDTO)=>Promise.resolve(testUser)),
            changePassword: jest.fn().mockImplementation((passwordUpdated: string)=>Promise.resolve({status:"updated"})),
            getUsers: jest.fn().mockImplementation((payload: PaginationAuthDTO)=>Promise.resolve(users)),
          }
        }
      ]
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });
  it('should to definded', () => {
    expect(authController).toBeDefined();
  });
  it('should return new User Information"',async () => {
    expect(await authController.register( {
    
      firstName: "string",
      lastName: "string",
      username: "string",
      password: "string",
      email: "string@gmail.com",
      phoneNumber: "string",
      address: "string",
      role: UserRole.admin  ,
    })).toBe(testUser);
  });

  it('should return access token"',async () => {

    expect(await authController.login( {
      username: "string",
      password: "string"
    })).toBe(testToken);
  });
  it('should return array of user"', async () => {
    const userList =await authController.getUsers({
      page: "1",
      limit:"10",
    })
    expect(userList).toBe(users);
  });
  it('should return status code',async()=>{
    expect(await authController.changePassword({passwordUpdated:"newpassword"})).toEqual({status:"updated"});
  })

})

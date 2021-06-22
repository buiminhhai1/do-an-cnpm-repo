import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { DataResponse, DestroyContract, ReturnDTO, SentDTO, StatusContract } from './transaction.dto';
import { promiseTimeout } from '@nestjs/terminus/dist/utils';
describe('Auth Controller', () => {
  let transactionController: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue:{
            sentToPartner: jest.fn().mockImplementation((sentData: SentDTO)=>Promise.resolve({ data: { status: true }, message: 'Sent success!' })),
            returnToPartner: jest.fn().mockImplementation((returnData: ReturnDTO)=>Promise.resolve({ data: { status: true }, message: 'The contract has been destroy success!' })),
            destroyContract: jest.fn().mockImplementation((destroyData: DestroyContract)=>Promise.resolve({ data: { status: true }, message: 'The contract has been destroy success!' }))
          }
        }
      ]
    }).compile();

    transactionController = module.get<TransactionController>(TransactionController);
  });
  it('should to defined', () => {
    expect(transactionController).toBeDefined();
  });
  it('should send contract value', async  ()=>{
        expect(await transactionController.sentContract({
        email:"test@gmail.com",
        contractId: "test-id",
        subject: "test-subject"
    })).toEqual({ data: { status: true }, message: 'Sent success!' });
  })
  it('should returnContract', async  ()=>{
        expect(await transactionController.returnContract({
            email:"test@gmail.com",
            contractId: "test-id"
        })).toEqual({ data: { status: true }, message: 'The contract has been destroy success!' });
    })
    it('should destroy contract', async  ()=>{
        expect(await transactionController.destroyContract({
            email:"test@gmail.com",
            contractId: "test-id"
        })).toEqual({ data: { status: true }, message: 'The contract has been destroy success!' });
    })
})

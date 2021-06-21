import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

describe('Auth Controller', () => {
  let transactionController: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue:{
            
          }
        }
      ]
    }).compile();

    transactionController = module.get<TransactionController>(TransactionController);
  });
  it('should to definded', () => {
    expect(transactionController).toBeDefined();
  });

})

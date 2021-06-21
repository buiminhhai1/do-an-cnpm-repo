import { Test, TestingModule } from '@nestjs/testing';
import { SignatureController } from './signature.controller';
import { SignatureService } from './signature.service';

describe('Auth Controller', () => {
  let signatureController: SignatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignatureController],
      providers: [
        {
          provide: SignatureService,
          useValue:{
            
          }
        }
      ]
    }).compile();

    signatureController = module.get<SignatureController>(SignatureController);
  });
  it('should to definded', () => {
    expect(signatureController).toBeDefined();
  });

})

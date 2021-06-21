import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStorageController } from './googlestorage.controller';
import { GoogleStorageService } from './googlestorage.service';

describe('Auth Controller', () => {
  let googleStorageController: GoogleStorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleStorageController],
      providers: [
        {
          provide: GoogleStorageService,
          useValue:{
            
          }
        }
      ]
    }).compile();

    googleStorageController = module.get<GoogleStorageController>(GoogleStorageController);
  });
  it('should to definded', () => {
    expect(googleStorageController).toBeDefined();
  });

})

import { MailerService } from '@nestjs-modules/mailer/dist/mailer.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('MailService', () => {
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{
        provide: MailerService,
        useValue:{
          sendMail: jest.fn().mockReturnValue(1),
        }
      }],
    }).compile();

    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(mailerService).toBeDefined();
  });
});

import { PaginationAuthDTO } from '@modules/auth';
import { Test, TestingModule } from '@nestjs/testing';
import { file } from 'googleapis/build/src/apis/file';
import { Any } from 'typeorm';
import { DeleteDTO, FileDetailDTO, PaginationContractDTO } from '.';
import { GoogleStorageController } from './googlestorage.controller';
import { UploadDTO } from './googlestorage.dto';
import { ContractRepository, GoogleStorageRepository } from './googlestorage.repository';
import { GoogleStorageService } from './googlestorage.service';

const listContract = {
  data: {
    next: -1,
    total: 1,
    contracts: [
      {
        createdAt: '2021-06-21T23:22:55.689Z',
        updatedAt: '2021-06-21T23:22:55.689Z',
        contractId: 'id',
        contractName: 'name.pdf',
        status: 'unsigned',
        type: 'owner',
        publicLink: 'link',
        download: 'link',
        size: '768950',
        thumbnailLink: 'link',
      },
    ],
  },
  message: 'Get list contract success!',
};
const detailContract = {
  data: {
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    contractId: 'id',
    contractName: 'name.pdf',
    status: 'unsigned',
    type: 'owner',
    publicLink: 'link',
    download: 'link',
    size: 'size',
    thumbnailLink: 'thumbnailLink',
  },
};
describe('Auth Controller', () => {
  let googleStorageController: GoogleStorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleStorageController],
      providers: [
        {
          provide: GoogleStorageService,
          useValue: {
            uploadContract: jest.fn().mockImplementation((payload: UploadDTO) =>
              Promise.resolve({
                data: {
                  id: 'id',
                  name: 'name.pdf',
                  type: 'application/pdf',
                },
              }),
            ),
            updateContract: jest
              .fn()
              .mockImplementation((contractFile: FileDetailDTO, payload: UploadDTO) =>
                Promise.resolve({
                  data: {},
                  message: 'Contract with ID id updated success!',
                }),
              ),
            getAllContract: jest
              .fn()
              .mockImplementation((payload: PaginationContractDTO) =>
                Promise.resolve(listContract),
              ),
            getDetailContract: jest
              .fn()
              .mockImplementation((payload: FileDetailDTO) => Promise.resolve(detailContract)),
            deleteContract: jest.fn().mockImplementation((payload: DeleteDTO) =>
              Promise.resolve({
                data: null,
                message: 'The contract not found',
              }),
            ),
          },
        },
        {
          provide: GoogleStorageRepository,
          useValue: {},
        },
        {
          provide: ContractRepository,
          useValue: {},
        },
      ],
    }).compile();

    googleStorageController = module.get<GoogleStorageController>(GoogleStorageController);
  });
  it('should to definded', () => {
    expect(googleStorageController).toBeDefined();
  });
  it('should to uploadContract', async () => {
    expect(await googleStorageController.uploadContract({ userId: 'user_id', files: Any })).toEqual(
      {
        data: {
          id: 'id',
          name: 'name.pdf',
          type: 'application/pdf',
        },
      },
    );
  });
  it('should to update contract', async () => {
    expect(
      await googleStorageController.dataContract({ files: Any }, { contractId: 'id' }),
    ).toEqual({
      data: {},
      message: 'Contract with ID id updated success!',
    });
  });
  it('should to show list contract', async () => {
    expect(await googleStorageController.listContract({ page: '1', limit: '10' })).toEqual(
      listContract,
    );
  });
  it('should to show detail contract', async () => {
    expect(await googleStorageController.getDetailContract({ contractId: 'id' })).toEqual(
      detailContract,
    );
  });
  it('should to delete contract', async () => {
    expect(await googleStorageController.deleteContract({ contractId: 'id' })).toEqual({
      data: null,
      message: 'The contract not found',
    });
  });
});

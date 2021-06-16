/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TenantAwareContext } from '@modules/database';
import { Inject, Injectable } from '@nestjs/common';
import { drive_v3, google } from 'googleapis';
import { DeleteDTO, FileDetailDTO, UploadDTO, DataResponse } from './googlestorage.dto';
import { GoogleStorageRepository, ContractRepository } from './googlestorage.repository';
import { Stream } from 'stream';
import { googleStorageConstants } from '@common';
import { ContractEntity, Status } from '../../entities';
import { omit, update } from 'lodash';

@Injectable()
export class GoogleStorageService {
  private drive;
  constructor(
    private readonly googleStorageRepo: GoogleStorageRepository,
    private readonly contractRepo: ContractRepository,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {
    this.drive = this.createDriveClient();
  }
  createDriveClient() {
    const client = googleStorageConstants.oAuth2Client;
    client.setCredentials({ refresh_token: googleStorageConstants.refresh_token });
    return google.drive({
      version: 'v3',
      auth: client,
    });
  }
  // MARK:- Create folder
  async createStore(): Promise<DataResponse> {
    const isFileExist = await this.findStoreExisted(this.context.userId);
    // Check folder name is exist
    if (!isFileExist) {
      const response = await this.createFolder(this.context.userId, null);
      const googleStorage = await this.getInfoStorage(this.context.userId);
      if (googleStorage === undefined) {
        return { data: await this.saveStoreDB(response.data.id) };
      } else {
        return { data: await this.updateStoreBD(response.data.id, googleStorage) };
      }
    } else {
      return { data: null, message: 'the folder has existed' };
    }
  }
  // MARK:- Create file
  async uploadContract(payload: Partial<UploadDTO>): Promise<DataResponse> {
    // Create stream buffer to create meta data for upload file on drive
    const googleStorage = await this.getInfoStorage(this.context.userId);
    if (googleStorage === undefined) {
      await this.createStore();
    }
    const storeExisted = await this.findStoreExisted(this.context.userId);
    if (!storeExisted) {
      return { data: null, message: 'the store not found!' };
    }
    const response = await this.createFile(payload.files[0], googleStorage.storeId);
    if (response.data !== null) {
      await this.saveContractDB(
        {
          contractId: response.data.id,
          contractName: payload.files[0].originalname,
        },
        googleStorage,
      );
      return {
        data: {
          id: response.data.id,
          name: response.data.name,
          type: response.data.mimeType,
        },
      };
    } else {
      return { data: null, message: 'upload this file not success!' };
    }
  }

  async getAllContract(): Promise<DataResponse> {
    const googleStorage = await this.getInfoStorage(this.context.userId);
    if (googleStorage !== undefined) {
      const files = await this.getListContract(googleStorage.storeId);
      const arrayList = [];
      for (let i = 0; i < files.length; i++) {
        arrayList.push({
          ...omit(files[i], 'version'),
          contractName: files[i].contractName,
          ...(await this.getInfoOfFile(files[i].contractId)),
        });
      }
      return { data: arrayList };
    } else {
      return { data: null, message: 'the user id not exist in database' };
    }
  }

  async getDetailContract(payload: Partial<FileDetailDTO>): Promise<DataResponse> {
    const contract = await this.contractRepo.findOne({ contractId: payload.contractId });
    if (contract === undefined) {
      return { data: null, message: 'the contract id not exist in database' };
    }
    const data = await this.getInfoOfFile(payload.contractId);
    return {
      data: {
        ...omit(contract, 'version'),
        contractName: contract.contractName,
        ...data,
      },
    };
  }

  async deleteContract(_query: Partial<DeleteDTO>): Promise<DataResponse> {
    await this.deleteContractDBUnsigned(_query.contractId);
    if (await this.findContractExisted(_query.contractId, this.context.userId)) {
      await this.drive.files.delete({
        fileId: _query.contractId,
      });
    } else {
      return { data: null, message: 'the contract not found' };
    }
    return { data: {} };
  }

  async updateContract(
    contractFile: Partial<UploadDTO>,
    payload: Partial<FileDetailDTO>,
  ): Promise<DataResponse> {
    const contract = await this.contractRepo.findOne({
      where: {
        contractId: payload.contractId,
      },
      relations: ['store'],
    });
    if (contract !== undefined && contract.status !== Status.signed) {
      const response = await this.updateFile(contractFile.files[0], payload.contractId, [
        contract.store.storeId,
      ]);
      contract.contractId = response.data.id;
      contract.contractName = contractFile.files[0].originalname;

      await this.contractRepo.update({ contractId: payload.contractId }, contract);
      return { data: {}, message: `Course with ID ${payload.contractId} updated success!` };
    }
    return { data: null, message: 'Can not updated!' };
  }

  // MARK:- OTHER FUNCTION
  async saveStoreDB(storeId: string): Promise<any> {
    return await this.googleStorageRepo.save(
      this.googleStorageRepo.create({
        storeId: storeId,
        storeName: this.context.userId,
        user: { id: this.context.userId },
      }),
    );
  }

  async updateStoreBD(storeId: string, googleStorage: any): Promise<any> {
    googleStorage.storeId = storeId;
    return await this.googleStorageRepo.update(googleStorage.id, googleStorage);
  }

  async saveContractDB(contract: any, store: any): Promise<any> {
    return await this.contractRepo.save(
      this.contractRepo.create({
        contractId: contract.contractId,
        contractName: contract.contractName,
        status: Status.unsigned,
        store: store,
      }),
    );
  }

  async deleteContractDBUnsigned(contractId: string) {
    const contract = await this.contractRepo.findOne({
      contractId: contractId,
    });
    if (contract !== undefined) {
      await this.contractRepo.remove(contract);
    }
  }

  async createFile(file: any, rootFolderId: string): Promise<any> {
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);
    const fileMetaData = {
      name: file.originalname,
      parents: [rootFolderId],
    };
    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };
    return await this.drive.files.create({
      requestBody: fileMetaData,
      media: media,
    });
  }

  async createFolder(folderName: string, rootFolderId?: string): Promise<any> {
    const fileMetaData = {
      name: folderName,
      parents: rootFolderId ? [rootFolderId] : null,
      mimeType: 'application/vnd.google-apps.folder',
    };
    return await this.drive.files.create({
      requestBody: fileMetaData,
    });
  }

  async updateFile(file: any, fileId: string, parents?: string[]): Promise<any> {
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);
    const fileMetaData = {
      name: file.originalname,
    };
    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };
    return await this.drive.files.update({
      fileId: fileId,
      addParents: parents !== null ? this.convertArrayToString(parents) : null,
      requestBody: fileMetaData,
      media: media,
    });
  }

  convertArrayToString(arr: string[]): string {
    let str = '';
    arr.forEach((element) => {
      str += element + ', ';
    });
    return str;
  }

  async updateFolder(folderName: string, FolderId: string) {
    const fileMetaData = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    this.drive.files.update({
      fileId: FolderId,
      requestBody: fileMetaData,
    });
  }

  async getInfoOfFile(fileId: string): Promise<{ publicLink: string; download: string }> {
    if (!(await this.findContractExisted(fileId, this.context.userId))) {
      return {
        publicLink: '',
        download: '',
      };
    }
    // waiting for access permission
    await this.drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'writer',
        type: 'anyone',
      },
    });
    // get public link and download link
    const result = await this.drive.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });
    if (result.status === 200) {
      return {
        publicLink: result.data.webViewLink,
        download: result.data.webContentLink,
      };
    } else {
      return {
        publicLink: '',
        download: '',
      };
    }
  }

  async findStoreExisted(userId: string): Promise<boolean> {
    const googleStorage = await this.getInfoStorage(userId);
    if (googleStorage !== undefined) {
      const folders = await this.drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and name = '${userId}' and trashed=false`,
      });
      if (folders.data.files.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async findContractExisted(contractId: string, userId: string): Promise<boolean> {
    const googleStorage = await this.getInfoStorage(userId);
    const contractsOnDrive = await this.drive.files.list({
      q: `mimeType = 'application/pdf' and '${googleStorage.storeId}' in parents and trashed=false`,
    });
    if (contractsOnDrive.status === 200) {
      if (contractsOnDrive.data.files.length > 0) {
        for (let i = 0; i < contractsOnDrive.data.files.length; i++) {
          if (contractsOnDrive.data.files[i].id === contractId) {
            return true;
          }
        }
        return false;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async getInfoStorage(userId: string): Promise<any> {
    const googleStorage = await this.googleStorageRepo.findOne({ storeName: userId });
    return googleStorage;
  }

  async getListContract(storeId: string): Promise<ContractEntity[]> {
    const listContracts = await this.contractRepo.find({
      store: await this.googleStorageRepo.findOne({ storeId: storeId }),
    });
    return listContracts;
  }

  async uploadFile(file: Buffer, name: string, mimeType: any, rootFolderId: string): Promise<any> {
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file);
    const fileMetaData = {
      name: name,
      parents: [rootFolderId],
    };
    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };
    return await this.drive.files.create({
      requestBody: fileMetaData,
      media: media,
    });
  }

  getStoreRepo(): GoogleStorageRepository {
    return this.googleStorageRepo;
  }

  getContractRepo(): ContractRepository {
    return this.contractRepo;
  }

  getDrive(): drive_v3.Drive {
    return this.drive;
  }
}

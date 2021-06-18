/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TenantAwareContext } from '@modules/database';
import { Inject, Injectable } from '@nestjs/common';
import { drive_v3, google } from 'googleapis';
import {
  DeleteDTO,
  FileDetailDTO,
  UploadDTO,
  DataResponse,
  PaginationContractDTO,
  GenericContractResponse,
} from './googlestorage.dto';
import { GoogleStorageRepository, ContractRepository } from './googlestorage.repository';
import { Stream } from 'stream';
import { DEFAULT_LIMIT, DEFAULT_PAGE, googleStorageConstants } from '@common';
import { ContractEntity, GoogleStorageEntity, Status } from '@entities';
import { omit } from 'lodash';
import { UpdateResult } from 'typeorm';

@Injectable()
export class GoogleStorageService {
  private drive: drive_v3.Drive;
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
  async createStore(userId: string): Promise<GoogleStorageEntity> {
    const isFileExist = await this.findStoreExisted(userId);
    // Check folder name is exist
    if (!isFileExist) {
      const response = await this.createFolder(userId, null);
      const googleStorage = await this.getInfoStorage(userId);
      if (googleStorage === null) {
        return await this.saveStoreDB(response.data.id, userId);
      } else {
        await this.updateStoreBD(response.data.id, googleStorage);
        return await this.getInfoStorage(userId);
      }
    }
  }
  // MARK:- Create file
  async uploadContract(payload: Partial<UploadDTO>): Promise<DataResponse> {
    // Create stream buffer to create meta data for upload file on drive
    const userId = payload.userId || this.context.userId;
    let googleStorage = await this.getInfoStorage(userId);
    if (googleStorage === null) {
      googleStorage = await this.createStore(userId);
    }
    const response = await this.createFile(payload.files[0], [googleStorage.storeId]);
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
      return { data: null, message: 'Upload this file not success!' };
    }
  }

  async getAllContract(payload: Partial<PaginationContractDTO>): Promise<DataResponse> {
    const response = await this.getListContract(payload, this.context.userId);
    if (response === null) {
      return { data: null, message: 'The user id not exist in database!' };
    } else {
      const arrayList = [];
      for (let i = 0; i < response.data.length; i++) {
        arrayList.push(
          omit(
            {
              ...omit(
                response.data[i],
                'version',
                'store',
                'id',
                payload.type === Status.signed ? 'signature' : '',
              ),
              signatureInfo: omit(response.data[i].signature, 'id', 'version'),
              contractName: response.data[i].contractName,
              ...(await this.getInfoOfFile(response.data[i].contractId)),
            },
            payload.type === Status.signed ? '' : 'signatureInfo',
          ),
        );
      }
      return {
        data: { next: response.next, total: response.total, contracts: arrayList },
        message: 'Get list contract success!',
      };
    }
  }

  async getDetailContract(payload: Partial<FileDetailDTO>): Promise<DataResponse> {
    const contract = await this.contractRepo.findOne({ contractId: payload.contractId });
    if (contract === undefined) {
      return { data: null, message: 'The contract id not exist in database!' };
    }
    const data = await this.getInfoOfFile(payload.contractId);
    return {
      data: {
        ...omit(contract, 'version', 'store', 'id'),
        contractName: contract.contractName,
        ...data,
      },
    };
  }

  async deleteContract(_query: Partial<DeleteDTO>): Promise<DataResponse> {
    await this.deleteContractDBUnsigned(_query.contractId);
    const isContractExisted = await this.findContractExisted(_query.contractId);
    if (isContractExisted) {
      await this.drive.files.delete({
        fileId: _query.contractId,
      });
      return {
        data: {},
        message: `The contract with ID ${_query.contractId} has been deleted success!`,
      };
    } else {
      return { data: null, message: 'The contract not found' };
    }
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
      return { data: {}, message: `Contract with ID ${payload.contractId} updated success!` };
    }
    return { data: null, message: `Can not updated contract with ID ${payload.contractId}!` };
  }

  // MARK:- OTHER FUNCTION
  async saveStoreDB(storeId: string, userId?: string): Promise<GoogleStorageEntity> {
    const id = userId || this.context.userId;
    return await this.googleStorageRepo.save(
      this.googleStorageRepo.create({
        storeId: storeId,
        storeName: id,
        user: { id: id },
      }),
    );
  }

  async updateStoreBD(storeId: string, googleStorage: any): Promise<UpdateResult> {
    googleStorage.storeId = storeId;
    return await this.googleStorageRepo.update(googleStorage.id, googleStorage);
  }

  async saveContractDB(contract: any, store: any): Promise<ContractEntity> {
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

  async createFile(file: any, parents?: string[]): Promise<any> {
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);
    const fileMetaData = {
      name: file.originalname,
      parents: parents,
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

  async createFolder(folderName: string, parents?: string[]): Promise<any> {
    const fileMetaData = {
      name: folderName,
      parents: parents,
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

  async getInfoOfFile(fileId: string): Promise<{ publicLink: string; download: string }> {
    const isContractExisted = await this.findContractExisted(fileId);
    if (!isContractExisted) {
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
    if (googleStorage !== null) {
      return true;
    } else {
      return false;
    }
  }

  async findContractExisted(contractId: string): Promise<boolean | null> {
    const contract = await this.contractRepo.findOne({ where: { contractId: contractId } });
    if (contract !== undefined) {
      return true;
    }
    return false;
  }

  async getInfoStorage(userId: string): Promise<GoogleStorageEntity | null> {
    const googleStorage = await this.googleStorageRepo.findOne({ storeName: userId });
    if (googleStorage === undefined) {
      return null;
    }
    return googleStorage;
  }

  async getListContract(
    payload: Partial<PaginationContractDTO>,
    userId: string,
  ): Promise<GenericContractResponse | null> {
    const googleStorage = await this.getInfoStorage(userId);
    if (googleStorage === null) {
      return null;
    }
    const pageSize = +payload.limit || DEFAULT_LIMIT;
    const pageNumber = +payload.page || DEFAULT_PAGE;
    const beforeCheck = this.contractRepo
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.store', 'store')
      .where('store.storeId = :storeId', { storeId: googleStorage.storeId });
    if (payload.type !== null) {
      beforeCheck.andWhere('contract.status = :status', { status: payload.type });
      if (payload.type === Status.signed) {
        beforeCheck.leftJoinAndSelect('contract.signature', 'signature');
      }
    }
    const response = await beforeCheck
      .orderBy('contract.createdAt', 'ASC')
      .take(pageSize)
      .skip(pageSize * (pageNumber - 1))
      .getManyAndCount();

    const data = response[0];
    const next = pageSize * pageNumber < response[1] ? pageNumber + 1 : -1;
    return { data, total: response[1], next };
  }

  async uploadFile(file: Buffer, name: string, mimeType: any, parents: string[]): Promise<any> {
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file);
    const fileMetaData = {
      name: name,
      parents: parents,
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

  async copyFile(fileId: string, userId: string): Promise<ContractEntity> {
    let googleStorage = await this.googleStorageRepo.findOne({ storeName: userId });
    if (googleStorage === undefined) {
      googleStorage = await this.createStore(userId);
    }
    const newfile = { parents: [googleStorage.storeId] };
    const response = await this.drive.files.copy({ fileId: fileId, requestBody: newfile });
    return await this.saveContractDB(
      {
        contractId: response.data.id,
        contractName: response.data.name,
      },
      googleStorage,
    );
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

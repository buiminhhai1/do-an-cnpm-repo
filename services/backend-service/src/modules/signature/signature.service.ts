/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Inject, Injectable } from '@nestjs/common';
import { KeyRepository, SignatureRepository } from './signature.repository';
import * as crypto from 'crypto';
import { TenantAwareContext } from '@modules/database';
import { Readable } from 'stream';
import { UserService } from '@modules/user';
import { ContractFileDTO, DataResponse, SignDTO, VerifyDTO } from './signature.dto';
import { GoogleStorageService } from '@modules/googlestorage';
import { Stream } from 'stream';
import { KeyEntity, Status } from '@entities';

@Injectable()
export class SignatureService {
  constructor(
    private readonly keyRepo: KeyRepository,
    private readonly userSevice: UserService,
    private readonly storeSevice: GoogleStorageService,
    private readonly signatureRepo: SignatureRepository,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}

  async createSignature(): Promise<KeyEntity> {
    const store = await this.storeSevice.getStoreRepo().findOne({ storeName: this.context.userId });
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      // The standard secure default length for RSA keys is 2048 bits
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki', // recommended to be 'spki' by the Node.js docs
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8', // recommended to be 'pkcs8' by the Node.js docs
        format: 'pem',
      },
    });
    const responsePrivateKey = await this.storeSevice.uploadFile(
      Buffer.from(privateKey),
      'privateKey',
      'application/pem',
      [store.storeId],
    );

    const responsePublicKey = await this.storeSevice.uploadFile(
      Buffer.from(publicKey),
      'publicKey',
      'application/pem',
      [store.storeId],
    );

    return await this.keyRepo.save(
      this.keyRepo.create({
        privateKeyId: responsePrivateKey.data.id,
        publicKeyId: responsePublicKey.data.id,
        user: { id: this.context.userId },
      }),
    );
  }

  async signing(payload: Partial<SignDTO>): Promise<DataResponse> {
    const user = await this.userSevice.getUserRepo().findOne({ id: this.context.userId });
    let key = await this.keyRepo.findOne({ user: user });
    if (key === undefined) {
      key = await this.createSignature();
    }
    const contractInfo = await this.storeSevice.getContractRepo().findOne({
      contractId: payload.contractId,
    });
    if (contractInfo === undefined) {
      return {
        data: { status: false },
        message: `The contract ID ${payload.contractId} not existed!`,
      };
    }
    if (contractInfo.status === Status.signed) {
      return {
        data: { status: false },
        message: `The contract ID ${payload.contractId} is signed!`,
      };
    }
    const privateKey = await this.getBufferFile(key.privateKeyId);
    const contract = await this.getBufferFile(payload.contractId);
    const sign = this.RSASign(privateKey.toString('utf8'), contract);
    await this.signatureRepo.save(
      this.signatureRepo.create({
        signature: sign,
        contract: { id: contractInfo.id },
      }),
    );
    contractInfo.status = Status.signed;
    await this.storeSevice
      .getContractRepo()
      .update({ contractId: payload.contractId }, contractInfo);
    return {
      data: { status: true },
      message: `Signing with the contract ID ${payload.contractId} is success!`,
    };
  }

  async verifyByFile(
    contractFile: Partial<ContractFileDTO>,
    payload: Partial<VerifyDTO>,
  ): Promise<DataResponse> {
    const user = await this.userSevice.getUserRepo().findOne({ email: payload.email });
    if (user === undefined) {
      return { data: { status: false }, message: `Email ${payload.email} not existed!` };
    }
    const key = await this.keyRepo.findOne({ user: user });
    if (key === undefined) {
      return {
        data: { status: false },
        message: `The signature ${payload.signature} not existed!`,
      };
    }
    const publicKey = await this.getBufferFile(key.publicKeyId);
    const verify = this.RSAVerify(
      publicKey.toString('utf8'),
      payload.signature,
      contractFile.files[0].buffer,
    );
    return {
      data: { status: verify },
      message: verify === true ? 'The signing is true!' : 'The Signature of contract is false!',
    };
  }

  async verifyByContractId(payload: Partial<VerifyDTO>): Promise<DataResponse> {
    const user = await this.userSevice.getUserRepo().findOne({ email: payload.email });
    if (user === undefined) {
      return { data: { status: false }, message: `Email ${payload.email} not existed!` };
    }
    const key = await this.keyRepo.findOne({ user: user });
    if (key === undefined) {
      return {
        data: { status: false },
        message: `The signature ${payload.signature} not existed!`,
      };
    }
    const contractInfo = await this.storeSevice.getContractRepo().findOne({
      contractId: payload.contractId,
    });
    if (contractInfo === undefined) {
      return {
        data: { status: false },
        message: `The contract ID ${payload.contractId} not existed!`,
      };
    }
    if (contractInfo.status !== Status.signed) {
      return {
        data: { status: false },
        message: `The contract ID ${payload.contractId} is unsigned!`,
      };
    }
    const publicKey = await this.getBufferFile(key.publicKeyId);
    const contract = await this.getBufferFile(payload.contractId);
    const verify = this.RSAVerify(publicKey.toString('utf8'), payload.signature, contract);
    return {
      data: { status: verify },
      message: verify === true ? 'The signing is true!' : 'The Signature of contract is false!',
    };
  }

  RSASign(privateKey: string, data: Buffer): string {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    sign.end();
    const sig = sign.sign(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      'base64',
    );
    return sig;
  }

  RSAVerify(publicKey: string, signature: string, data: Buffer): boolean {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      signature,
      'base64',
    );
  }

  getReadableStream(buffer: Buffer): Readable {
    const stream = new Readable();

    stream.push(buffer);
    stream.push(null);

    return stream;
  }

  async getBufferFile(fileId: string): Promise<Buffer> {
    await this.storeSevice.getDrive().permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'writer',
        type: 'anyone',
      },
    });
    const response = await this.storeSevice.getDrive().files.get(
      {
        fileId: fileId,
        alt: 'media',
        supportsAllDrives: true,
      },
      { responseType: 'stream' },
    );
    return await this.streamToBuffer(response.data);
  }

  async streamToBuffer(stream: Stream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const data = [];

      stream.on('data', (chunk) => {
        data.push(chunk);
      });

      stream.on('end', () => {
        resolve(Buffer.concat(data));
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });
  }
}

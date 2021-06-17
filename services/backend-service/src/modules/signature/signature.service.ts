/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Inject, Injectable } from '@nestjs/common';
import { SignatureRepository, SignContractRepository } from './signature.repository';
import * as crypto from 'crypto';
import { TenantAwareContext } from '@modules/database';
import { Readable } from 'stream';
import { UserService } from '@modules/user';
import { ContractFileDTO, DataResponse, SignDTO, VerifyDTO } from './signature.dto';
import { GoogleStorageService } from '../googlestorage';
import { Stream } from 'stream';
import { Status } from '../../entities';

@Injectable()
export class SignatureService {
  constructor(
    private readonly signatureRepo: SignatureRepository,
    private readonly userSevice: UserService,
    private readonly storeSevice: GoogleStorageService,
    private readonly signContractRepo: SignContractRepository,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}

  async createSignature() {
    const user = await this.userSevice.getUserRepo().findOne({
      where: {
        id: this.context.userId,
      },
      relations: ['sign'],
    });
    const store = await this.storeSevice.getStoreRepo().findOne({ storeName: this.context.userId });
    if (user !== undefined) {
      if (user.sign === null) {
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
        if (store === undefined) {
          return false;
        }
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

        await this.signatureRepo.save(
          this.signatureRepo.create({
            privateKeyId: responsePrivateKey.data.id,
            publicKeyId: responsePublicKey.data.id,
            user: { id: this.context.userId },
          }),
        );
      }
    }
  }

  async signing(payload: Partial<SignDTO>): Promise<DataResponse> {
    const user = await this.userSevice.getUserRepo().findOne({
      where: {
        id: this.context.userId,
      },
      relations: ['sign'],
    });
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
        message: `Signing with the contract ID ${payload.contractId} is fail!`,
      };
    }
    const privateKey = await this.getBufferFile(user.sign.privateKeyId);
    const contract = await this.getBufferFile(payload.contractId);
    const sign = this.RSASign(privateKey.toString('utf8'), contract);
    await this.signContractRepo.save(
      this.signContractRepo.create({
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

  async verify(contractFile: ContractFileDTO, payload: VerifyDTO): Promise<DataResponse> {
    const user = await this.userSevice.getUserRepo().findOne({
      where: {
        email: payload.email,
      },
      relations: ['sign'],
    });
    if (user === undefined) {
      return { data: { status: false }, message: `Email ${payload.email} not existed!` };
    }
    const publicKey = await this.getBufferFile(user.sign.publicKeyId);
    const verify = this.RSAVerify(
      publicKey.toString('utf8'),
      payload.signature,
      contractFile.files[0].buffer,
    );
    return {
      data: { status: verify },
      message: verify === true ? 'The signing is true!' : ' The signing or contract is false!',
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

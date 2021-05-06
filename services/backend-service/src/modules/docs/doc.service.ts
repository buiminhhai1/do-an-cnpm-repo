import { TenantAwareContext } from '@modules/database';
import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { UploadDTO, UploadStatusResponse } from './doc.dto';
import { DocumentRepository } from './doc.repository';
import { Stream } from 'stream';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const bufferStream = new Stream.PassThrough();
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepo: DocumentRepository,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}

  async uploadFile(payload: Partial<UploadDTO>): Promise<UploadStatusResponse> {
    try {
      oAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
      });
      const drive = google.drive({
        version: 'v3',
        auth: oAuth2Client,
      });

      let isFileExist = false;
      let folder_id = '';
      const folders = await drive.files.list({});
      for (let i = 0; i < folders.data.files.length; i++) {
        if (folders.data.files[i].name == this.context.userId) {
          folder_id = folders.data.files[i].id;
          isFileExist = true;
          break;
        }
      }

      if (!isFileExist) {
        const filemetadata = {
          name: this.context.userId,
          mimeType: 'application/vnd.google-apps.folder',
        };
        const new_folder = await drive.files.create({
          requestBody: filemetadata,
        });
        folder_id = new_folder.data.id;
      }

      const files = await drive.files.list({
        q: `'${folder_id}' in parents and mimeType = 'application/pdf'`,
      });

      console.log(files.data);

      const buf = Buffer.from(payload.file, 'base64');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      bufferStream.end(buf);

      const filemetadata = {
        name: payload.name,
        parents: [folder_id],
      };
      const media = {
        mimeType: 'application/pdf',
        body: bufferStream,
      };
      const response = await drive.files.create({
        requestBody: filemetadata,
        media: media,
      });
      // await this.documentRepo.save(
      //   this.documentRepo.create({ fileID: 'vabc', user: { id: this.context.userId } }), // tao no nhu nay ne
      // );
      return {
        status: response.data != null ? true : false,
        kind: response.data.kind,
        id: response.data.id,
        name: response.data.name,
        mimeType: response.data.mimeType,
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
        kind: '',
        id: '',
        name: '',
        mimeType: '',
      };
    }
  }

  // async singleFile(payload: Partial<SignleFileDTO>): Promise<string> {

  // }
}

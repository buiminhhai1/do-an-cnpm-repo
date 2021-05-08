import { TenantAwareContext } from '@modules/database';
import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import {
  DeleteDataResponse,
  DeleteDTO,
  ListFileDataResponse,
  UploadDTO,
  UploadStatusResponse,
} from './googledrive.dto';
import { GoogleDriveRepository } from './googledrive.repository';
import { Stream } from 'stream';
import { googleDriveConstants } from '../../common';
// MARK:- Properties
const upload_response_json = new UploadStatusResponse();
const bufferStream = new Stream.PassThrough();
// Set const token always choosen account dx team
googleDriveConstants.oAuth2Client.setCredentials({
  refresh_token: googleDriveConstants.refresh_token,
});
// Config drive function
const drive = google.drive({
  version: 'v3',
  auth: googleDriveConstants.oAuth2Client,
});

@Injectable()
export class GoogleDriveService {
  constructor(
    private readonly googleDriveRepo: GoogleDriveRepository,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}
  // MARK:- Upload file
  async uploadFile(payload: Partial<UploadDTO>): Promise<UploadStatusResponse> {
    upload_response_json.reNewData();
    let isFileExist = false;
    let folder_id = '';
    try {
      // Create the folder with the name is user id if the file the first upload file
      const folders = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and trashed=false`,
      });
      for (let i = 0; i < folders.data.files.length; i++) {
        if (folders.data.files[i].name == this.context.userId) {
          folder_id = folders.data.files[i].id;
          isFileExist = true;
          break;
        }
      }
      // Check folder name is exist
      if (!isFileExist) {
        const filemetadata = {
          name: this.context.userId,
          mimeType: 'application/vnd.google-apps.folder',
        };
        const new_folder = await drive.files.create({
          requestBody: filemetadata,
        });
        folder_id = new_folder.data.id;
        await this.uploadDb(folder_id);
      }
      // Create stream buffer to create meta data for upload file on drive
      const buf = Buffer.from(payload.file, 'base64');
      bufferStream.end(buf);

      const fileMetaData = {
        name: payload.name,
        parents: [folder_id],
      };
      const media = {
        mimeType: payload.type,
        body: bufferStream,
      };
      // waiting for create file on drive
      const response = await drive.files.create({
        requestBody: fileMetaData,
        media: media,
      });
      //
      upload_response_json.statusCode = response.status;
      if (response.data != null) {
        upload_response_json.data = {
          id: response.data.id,
          name: response.data.name,
          type: response.data.mimeType,
        };
        return upload_response_json;
      } else {
        return upload_response_json;
      }
    } catch (e) {
      //console.log(e);
      upload_response_json.statusCode = 500;
      return upload_response_json;
    }
  }
  async uploadDb(folderId: string): Promise<boolean> {
    const google_drive_model = await this.googleDriveRepo
      .createQueryBuilder('google_drive')
      .where('google_drive.userId = :userId', { userId: this.context.userId })
      .getOne();
    if (google_drive_model == null) {
      await this.googleDriveRepo.save(
        this.googleDriveRepo.create({ folderId: folderId, user: { id: this.context.userId } }),
      );
    } else {
      google_drive_model.folderId = folderId;
      await this.googleDriveRepo.save(google_drive_model);
    }
    return true;
  }

  async getAllFile(): Promise<ListFileDataResponse> {
    try {
      const google_drive_model = await this.googleDriveRepo
        .createQueryBuilder('google_drive')
        .where('google_drive.userId = :userId', { userId: this.context.userId })
        .getOne();
      if (google_drive_model != null) {
        const files = await drive.files.list({
          q: `'${google_drive_model.folderId}' in parents and trashed=false`,
        });
        const arrayList = [];
        for (let i = 0; i < files.data.files.length; i++) {
          arrayList.push({
            fildeId: files.data.files[i].id,
            ...(await this.generatePublicUrl(files.data.files[i].id)),
          });
        }

        return {
          statusCode: files.status,
          data: arrayList,
        };
      } else {
        return {
          statusCode: 400,
          data: null,
        };
      }
    } catch (error) {
      //console.log(error);
      return {
        statusCode: 500,
        data: null,
      };
    }
  }

  async generatePublicUrl(fileId: string): Promise<any> {
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'writer',
          type: 'anyone',
        },
      });
      const result = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
      });
      return {
        link: result.data.webViewLink,
        download: result.data.webContentLink,
      };
    } catch (error) {
      return {
        link: '',
        download: '',
      };
    }
  }

  async deleteFile(_query: Partial<DeleteDTO>): Promise<DeleteDataResponse> {
    try {
      //console.log(_query);
      const response = await drive.files.delete({
        fileId: _query.fileId,
      });
      return { statusCode: response.status, data: response.data };
    } catch (error) {
      //console.log(error);
      return { statusCode: 500, data: null };
    }
  }
}

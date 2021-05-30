import { TenantAwareContext } from '@modules/database';
import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import {
  DeleteDataResponse,
  DeleteDTO,
  ListFileDataResponse,
  UploadDTO,
  UploadStatusResponse,
} from './googlestorage.dto';
import { GoogleStorageRepository } from './googlestorage.repository';
import { Stream } from 'stream';
import { googleStorageConstants } from '../../common';
// Set const token always choosen account dx team
googleStorageConstants.oAuth2Client.setCredentials({
  refresh_token: googleStorageConstants.refresh_token,
});
// Config drive function
const drive = google.drive({
  version: 'v3',
  auth: googleStorageConstants.oAuth2Client,
});

@Injectable()
export class GoogleStorageService {
  constructor(
    private readonly googleStorageRepo: GoogleStorageRepository,
    @Inject(TenantAwareContext) private readonly context: TenantAwareContext,
  ) {}
  // MARK:- Upload file
  async uploadFile(payload: Partial<UploadDTO>): Promise<{ data: UploadStatusResponse }> {
    let isFileExist = false;
    let folder_id = '';
    try {
      // Create the folder with the name is user id if the file the first upload file
      const folders = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and trashed=false`,
      });
      for (let i = 0; i < folders.data.files.length; i++) {
        if (folders.data.files[i].name === this.context.userId) {
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
      // MARK:- Properties
      const bufferStream = new Stream.PassThrough();
      bufferStream.end(payload.files[0].buffer);

      const fileMetaData = {
        name: payload.files[0].originalname,
        parents: [folder_id],
      };
      const media = {
        mimeType: payload.files[0].mimetype,
        body: bufferStream,
      };
      // waiting for create file on drive
      const response = await drive.files.create({
        requestBody: fileMetaData,
        media: media,
      });
      //
      if (response.data != null) {
        return {
          data: {
            id: response.data.id,
            name: response.data.name,
            type: response.data.mimeType,
          },
        };
      } else {
        return { data: null };
      }
    } catch (e) {
      return { data: null };
    }
  }
  async uploadDb(folderId: string): Promise<boolean> {
    const google_drive_model = await this.googleStorageRepo
      .createQueryBuilder('google_drive')
      .where('google_drive.userId = :userId', { userId: this.context.userId })
      .getOne();
    if (google_drive_model == null) {
      await this.googleStorageRepo.save(
        this.googleStorageRepo.create({ folderId: folderId, user: { id: this.context.userId } }),
      );
    } else {
      google_drive_model.folderId = folderId;
      await this.googleStorageRepo.save(google_drive_model);
    }
    return true;
  }

  async getAllFile(): Promise<{ data: ListFileDataResponse[] }> {
    try {
      const google_drive_model = await this.googleStorageRepo
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
            fileId: files.data.files[i].id,
            ...(await this.generatePublicUrl(files.data.files[i].id)),
          });
        }

        return { data: arrayList };
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async generatePublicUrl(fileId: string): Promise<{ publicLink: string; download: string }> {
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
        publicLink: result.data.webViewLink,
        download: result.data.webContentLink,
      };
    } catch (error) {
      return {
        publicLink: null,
        download: null,
      };
    }
  }

  async deleteFile(_query: Partial<DeleteDTO>): Promise<DeleteDataResponse> {
    try {
      //console.log(_query);
      const response = await drive.files.delete({
        fileId: _query.fileId,
      });
      return { data: response.data };
    } catch (error) {
      return { data: null };
    }
  }
}

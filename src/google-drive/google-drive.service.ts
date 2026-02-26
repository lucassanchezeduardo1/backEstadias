import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as fs from 'fs';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private drive;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_DRIVE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_DRIVE_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GOOGLE_DRIVE_REFRESH_TOKEN');

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  async uploadFile(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
    try {
      const folderId = this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID');

      const fileMetadata = {
        name: filename,
        parents: folderId ? [folderId] : [],
      };

      const media = {
        mimeType: mimetype,
        body: Readable.from(buffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
        supportsAllDrives: true,
      });

      return response.data.id;
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw new InternalServerErrorException('Error al subir archivo a Google Drive');
    }
  }

  async getFileStream(fileId: string) {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media', supportsAllDrives: true },
        { responseType: 'stream' }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting file from Google Drive:', error);
      throw new InternalServerErrorException('Error al obtener archivo de Google Drive');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId, supportsAllDrives: true });
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      // No lanzamos excepción si falla el borrado, solo logueamos
    }
  }
}

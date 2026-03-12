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

  /**
   * Obtiene el ID de una carpeta por su ruta (ej: "Publicaciones/Imagenes"), creándolas si no existen.
   * @param path Ruta de la carpeta separada por "/"
   * @param parentFolderId ID de la carpeta padre inicial (opcional)
   */
  async getOrCreateFolder(path: string, parentFolderId?: string): Promise<string> {
    try {
      const segments = path.split('/').filter(s => s.length > 0);
      let currentParentId = parentFolderId || this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID');

      for (const segment of segments) {
        // Buscar el segmento en los padres actuales
        const query = `name = '${segment}' and mimeType = 'application/vnd.google-apps.folder' and '${currentParentId}' in parents and trashed = false`;
        const response = await this.drive.files.list({
          q: query,
          fields: 'files(id, name)',
          spaces: 'drive',
        });

        if (response.data.files && response.data.files.length > 0) {
          currentParentId = response.data.files[0].id;
        } else {
          // Si no existe, crearla
          const fileMetadata = {
            name: segment,
            mimeType: 'application/vnd.google-apps.folder',
            parents: currentParentId ? [currentParentId] : [],
          };

          const folder = await this.drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
          });

          currentParentId = folder.data.id;
        }
      }

      return currentParentId as string;
    } catch (error) {
      console.error(`Error al gestionar ruta ${path} en Google Drive:`, error);
      throw new InternalServerErrorException(`Error al gestionar carpetas en Google Drive: ${path}`);
    }
  }

  async uploadFile(buffer: Buffer, filename: string, mimetype: string, folderName?: string): Promise<string> {
    try {
      let folderId = this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID');

      if (folderName) {
        folderId = await this.getOrCreateFolder(folderName, folderId);
      }

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
        { fileId, alt: 'media', supportsAllDrives: true, acknowledgeAbuse: true },
        { responseType: 'stream' }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting file from Google Drive:', error.message || error);
      if (error.response) {
        console.error('Data:', error.response.data);
        console.error('Status:', error.response.status);
      }
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

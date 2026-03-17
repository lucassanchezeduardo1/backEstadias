import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private driveInstance: drive_v3.Drive | null = null;
  private readonly logger = new Logger(GoogleDriveService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Lazily initializes and returns the Google Drive instance.
   * This reduces memory usage by only creating the client when needed.
   */
  private get drive(): drive_v3.Drive {
    if (this.driveInstance) {
      return this.driveInstance;
    }

    try {
      const clientId = this.configService.get<string>('GOOGLE_DRIVE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_DRIVE_CLIENT_SECRET');
      const refreshToken = this.configService.get<string>('GOOGLE_DRIVE_REFRESH_TOKEN');

      if (!clientId || !clientSecret || !refreshToken) {
        this.logger.error('Google Drive credentials are not fully configured in environment variables');
        throw new InternalServerErrorException('Configuración de Google Drive incompleta');
      }

      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      this.driveInstance = google.drive({ version: 'v3', auth: oauth2Client });
      this.logger.log('Google Drive client initialized successfully (lazy)');
      
      return this.driveInstance;
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive client:', error.message);
      throw new InternalServerErrorException('Error al inicializar el servicio de Google Drive');
    }
  }

  /**
   * Obtiene el ID de una carpeta por su ruta (ej: "Publicaciones/Imagenes"), creándolas si no existen.
   */
  async getOrCreateFolder(path: string, parentFolderId?: string): Promise<string> {
    try {
      const segments = path.split('/').filter(s => s.length > 0);
      let currentParentId = parentFolderId || this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID');

      for (const segment of segments) {
        const query = `name = '${segment}' and mimeType = 'application/vnd.google-apps.folder' and '${currentParentId}' in parents and trashed = false`;
        const response = await this.drive.files.list({
          q: query,
          fields: 'files(id, name)',
          spaces: 'drive',
        });

        if (response.data.files && response.data.files.length > 0) {
          currentParentId = response.data.files[0].id as string;
        } else {
          const fileMetadata = {
            name: segment,
            mimeType: 'application/vnd.google-apps.folder',
            parents: currentParentId ? [currentParentId] : [],
          };

          const folder = await this.drive.files.create({
            requestBody: fileMetadata as any,
            fields: 'id',
          });

          currentParentId = folder.data.id as string;
        }
      }

      return currentParentId as string;
    } catch (error) {
      this.logger.error(`Error al gestionar ruta ${path} en Google Drive:`, error.message);
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

      return response.data.id as string;
    } catch (error) {
      this.logger.error('Error uploading to Google Drive:', error.message);
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
      this.logger.error(`Error getting file ${fileId} from Google Drive:`, error.message);
      throw new InternalServerErrorException('Error al obtener archivo de Google Drive');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId, supportsAllDrives: true });
    } catch (error) {
      this.logger.warn(`Error deleting file ${fileId} from Google Drive:`, error.message);
    }
  }
}


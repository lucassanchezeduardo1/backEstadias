import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/pdfs', // Carpeta donde se guardan
    filename: (req, file, callback) => {
      // Generar nombre único
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `publicacion-${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== 'application/pdf') {
      return callback(new Error('Solo se permiten archivos PDF'), false);
    }
    callback(null, true);
  },
};
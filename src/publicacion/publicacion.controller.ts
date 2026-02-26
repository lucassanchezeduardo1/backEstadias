import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Request, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException, UploadedFiles, NotFoundException } from '@nestjs/common';
import { PublicacionService } from './publicacion.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';


import { GoogleDriveService } from '../google-drive/google-drive.service';


@Controller('publicacion')
export class PublicacionController {
  constructor(
    private readonly publicacionService: PublicacionService,
    private readonly googleDriveService: GoogleDriveService,
  ) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'img_portada', maxCount: 1 },
        { name: 'img_contenido', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
            return cb(
              new BadRequestException('Solo se permiten archivos PDF'),
              false,
            );
          }

          if (
            (file.fieldname === 'img_portada' || file.fieldname === 'img_contenido') &&
            !file.mimetype.startsWith('image/')
          ) {
            return cb(
              new BadRequestException('Solo se permiten imágenes'),
              false,
            );
          }

          cb(null, true);
        },
      },
    ),
  )
  async create(
    @Body() createDto: CreatePublicacionDto,
    @UploadedFiles()
    files: {
      pdf?: Express.Multer.File[];
      img_portada?: Express.Multer.File[];
      img_contenido?: Express.Multer.File[];
    },
  ) {
    if (!files?.pdf || !files?.img_portada) {
      throw new BadRequestException(
        'Debe subir un PDF y una imagen de portada',
      );
    }

    const pdf = files.pdf[0];
    const imagenPortada = files.img_portada[0];
    const imagenContenido = files.img_contenido ? files.img_contenido[0] : null;

    // Subir a Google Drive
    const pdfName = `${Date.now()}-${pdf.originalname}`;
    const googleDriveId = await this.googleDriveService.uploadFile(
      pdf.buffer,
      pdfName,
      pdf.mimetype,
    );

    return this.publicacionService.create(
      createDto,
      imagenPortada.buffer,
      imagenContenido ? imagenContenido.buffer : null,
      `googleDrive://${googleDriveId}`,
    );
  }

  @Get()
  findAll() {
    return this.publicacionService.findAll();
  }

  @Get('investigador/:investigadorId')
  findByInvestigador(@Param('investigadorId', ParseIntPipe) investigadorId: number) {
    return this.publicacionService.findByInvestigador(investigadorId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.publicacionService.findOne(+id);
  }

  @Get(':id/v')
  findOneAndIncrementVistas(@Param('id') id: number) {
    return this.publicacionService.findOneAndIncrementVistas(+id);
  }


  @Patch(':id/vistas')
  incrementarVistas(@Param('id') id: number) {
    return this.publicacionService.incrementarVistas(+id);
  }


  @Patch(':id/descargas')
  incrementarDescargas(@Param('id') id: number) {
    return this.publicacionService.incrementarDescargas(+id);
  }


  @Get(':id/imagen')
  async getImagen(@Param('id') id: number, @Res() res: Response) {
    const publicacion =
      await this.publicacionService.findOneWithImage(+id);

    res.set({
      'Content-Type': 'image/jpeg',
    });

    res.send(publicacion.img_portada);
  }

  @Get(':id/imagen-contenido')
  async getImagenContenido(@Param('id') id: number, @Res() res: Response) {
    const publicacion =
      await this.publicacionService.findOneWithImage(+id);

    if (!publicacion.img_contenido) {
      throw new NotFoundException('Esta publicación no tiene imagen de contenido');
    }

    res.set({
      'Content-Type': 'image/jpeg',
    });

    res.send(publicacion.img_contenido);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: number, @Res() res: Response) {
    const publicacion = await this.publicacionService.findOne(+id);

    if (!publicacion.pdf_url) {
      throw new NotFoundException('Archivo PDF no encontrado');
    }

    // Verificar si es de Google Drive
    if (publicacion.pdf_url.startsWith('googleDrive://')) {
      const fileId = publicacion.pdf_url.replace('googleDrive://', '');
      const stream = await this.googleDriveService.getFileStream(fileId);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="publicacion-${id}.pdf"`,
      });

      return stream.pipe(res);
    }

    // Lógica antigua para archivos locales (retrocompatibilidad)
    const filePath = `.${publicacion.pdf_url}`;

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo físico no existe en el servidor');
    }

    res.sendFile(filePath, { root: '.' });
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdatePublicacionDto,
  ) {
    return this.publicacionService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.publicacionService.remove(+id);
  }
}

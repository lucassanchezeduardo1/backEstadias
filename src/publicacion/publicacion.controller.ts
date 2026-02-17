import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Request, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException, UploadedFiles } from '@nestjs/common';
import { PublicacionService } from './publicacion.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';


@Controller('publicacion')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'img_portada', maxCount: 1 },
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
            file.fieldname === 'img_portada' &&
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
    },
  ) {
    if (!files?.pdf || !files?.img_portada) {
      throw new BadRequestException(
        'Debe subir un PDF y una imagen de portada',
      );
    }

    const pdf = files.pdf[0];
    const imagen = files.img_portada[0];

    // Crear carpeta si no existe
    const uploadPath = './uploads/pdfs';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const pdfName = `${Date.now()}-${pdf.originalname}`;
    const pdfPath = `${uploadPath}/${pdfName}`;

    await fsPromises.writeFile(pdfPath, pdf.buffer);

    return this.publicacionService.create(
      createDto,
      imagen.buffer,
      `/uploads/pdfs/${pdfName}`,
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

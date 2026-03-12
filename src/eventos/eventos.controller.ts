import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { GoogleDriveService } from '../google-drive/google-drive.service';


@Controller('eventos')
export class EventosController {
  constructor(
    private readonly eventosService: EventosService,
    private readonly googleDriveService: GoogleDriveService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('imagen', {
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async create(
    @Body() createEventoDto: CreateEventoDto,
    @UploadedFile() imagen: Express.Multer.File,
    @Request() req: any
  ) {
    // Validar que se haya subido una imagen
    if (!imagen) {
      throw new BadRequestException('La imagen del evento es obligatoria');
    }

    // Validar tipo de archivo (solo imágenes)
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(imagen.mimetype)) {
      throw new BadRequestException('Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imagen.size > maxSize) {
      throw new BadRequestException('La imagen no puede superar 5MB');
    }

    const investigadorId = req.user?.id || createEventoDto.investigador_organizador_id || 1;

    // Subir a Google Drive
    const fileName = `EVENTO_${Date.now()}_${imagen.originalname}`;
    const driveId = await this.googleDriveService.uploadFile(
      imagen.buffer,
      fileName,
      imagen.mimetype,
      'Eventos/Imagenes',
    );

    return await this.eventosService.create(
      createEventoDto,
      investigadorId,
      `googleDrive://${driveId}`
    );
  }

  // ============================================
  // OBTENER IMAGEN DEL EVENTO
  // ============================================
  @Get(':id/imagen')
  async getImagen(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const evento = await this.eventosService.findOne(id);
    const imagenUrl = (await this.eventosService.getImagen(id)) as unknown as string;

    if (imagenUrl && typeof imagenUrl === 'string' && imagenUrl.startsWith('googleDrive://')) {
      const fileId = imagenUrl.replace('googleDrive://', '');
      const stream = await this.googleDriveService.getFileStream(fileId);
      res.setHeader('Content-Type', 'image/jpeg');
      return stream.pipe(res);
    }

    // Retrocompatibilidad con Buffer
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imagenUrl);
  }

  // ============================================
  // TODOS LOS EVENTOS
  // ============================================
  @Get('all')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.eventosService.findAll(+page, +limit);
  }

  @Get('proximos')
  async findProximos(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.eventosService.findProximos(+page, +limit);
  }

  @Get('pasados')
  async findPasados(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.eventosService.findPasados(+page, +limit);
  }

  @Get('estadisticas')
  async getEstadisticas() {
    return await this.eventosService.getEstadisticas();
  }

  @Get('buscar')
  async buscar(@Query('termino') termino: string) {
    if (!termino) {
      return { message: 'Debe proporcionar un término de búsqueda', eventos: [] };
    }
    return await this.eventosService.buscar(termino);
  }

  @Get('categoria/:categoriaId')
  async findByCategoria(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.eventosService.findByCategoria(categoriaId, +page, +limit);
  }

  @Get('modalidad/:modalidad')
  async findByModalidad(
    @Param('modalidad') modalidad: 'presencial' | 'virtual' | 'hibrida',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.eventosService.findByModalidad(modalidad, +page, +limit);
  }

  @Get('investigador/:investigadorId')
  async findByInvestigador(
    @Param('investigadorId', ParseIntPipe) investigadorId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.eventosService.findByInvestigador(investigadorId, +page, +limit);
  }

  @Get('mis-eventos')
  async findMisEventos(@Request() req: any) {
    const investigadorId = req.user?.id || 1;
    return await this.eventosService.findByInvestigador(investigadorId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.eventosService.findOne(id);
  }

  // ============================================
  // ACTUALIZAR EVENTO (con imagen opcional)
  // ============================================
  @Patch(':id')
  @UseInterceptors(FileInterceptor('imagen', {
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  })) // ⬅️ Imagen opcional
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventoDto: UpdateEventoDto,
    @UploadedFile() imagen: Express.Multer.File, // ⬅️ Opcional
    @Request() req: any
  ) {
    // Si se envió imagen, validar
    if (imagen) {
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!tiposPermitidos.includes(imagen.mimetype)) {
        throw new BadRequestException('Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)');
      }

      const maxSize = 5 * 1024 * 1024;
      if (imagen.size > maxSize) {
        throw new BadRequestException('La imagen no puede superar 5MB');
      }
    }

    const investigadorId = req.user?.id || (updateEventoDto.investigador_organizador_id ? Number(updateEventoDto.investigador_organizador_id) : 1);

    let driveUrl: string | undefined = undefined;
    if (imagen) {
      const fileName = `EVENTO_${Date.now()}_${imagen.originalname}`;
      const driveId = await this.googleDriveService.uploadFile(
        imagen.buffer,
        fileName,
        imagen.mimetype,
        'Eventos/Imagenes',
      );
      driveUrl = `googleDrive://${driveId}`;
    }

    return await this.eventosService.update(
      id,
      updateEventoDto,
      investigadorId,
      driveUrl
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const investigadorId = req.user?.id || 1;
    return await this.eventosService.remove(id, investigadorId);
  }
}

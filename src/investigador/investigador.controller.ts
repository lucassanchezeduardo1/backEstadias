import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, ParseIntPipe, Res, Query } from '@nestjs/common';
import { InvestigadorService } from './investigador.service';
import { CreateInvestigadorDto } from './dto/create-investigador.dto';
import { UpdateInvestigadorDto } from './dto/update-investigador.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { GoogleDriveService } from '../google-drive/google-drive.service';

@Controller('investigador')
export class InvestigadorController {
  constructor(
    private readonly investigadorService: InvestigadorService,
    private readonly googleDriveService: GoogleDriveService,
  ) { }

  @Get(':id/foto')
  async getFoto(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const fotoUrl = await this.investigadorService.getFoto(id);

    if (fotoUrl && typeof fotoUrl === 'string' && fotoUrl.startsWith('googleDrive://')) {
      const fileId = fotoUrl.replace('googleDrive://', '');
      const stream = await this.googleDriveService.getFileStream(fileId);
      res.set('Content-Type', 'image/jpeg');
      return stream.pipe(res);
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(fotoUrl);
  }

  @Post()
  @UseInterceptors(FileInterceptor('foto_perfil', {
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async create(
    @Body() createInvestigadorDto: CreateInvestigadorDto,
    @UploadedFile() foto: Express.Multer.File
  ) {
    // Validar que se haya subido una foto
    if (!foto) {
      throw new BadRequestException('La foto de perfil es obligatoria');
    }

    // Validar tipo de archivo (solo imágenes)
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(foto.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten imágenes en formato JPEG, JPG, PNG o WEBP'
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (foto.size > maxSize) {
      throw new BadRequestException('La imagen no puede superar 5MB');
    }

    // Subir a Google Drive
    const fileName = `PERFIL_${Date.now()}_${foto.originalname}`;
    const driveId = await this.googleDriveService.uploadFile(
      foto.buffer,
      fileName,
      foto.mimetype,
      'Perfiles/Fotos',
    );

    return await this.investigadorService.createInvestigador(
      createInvestigadorDto,
      `googleDrive://${driveId}`
    );
  }

  @Get('all')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.investigadorService.findAll(+page, +limit);
  }


  @Get('aprobados')
  async findAllAprobados(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.investigadorService.findAllAprobados(+page, +limit);
  }

  @Get('pendientes')
  async findAllPendientes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.investigadorService.findAllPendientes(+page, +limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.investigadorService.findOne(id);
  }


  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto_perfil', {
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvestigadorDto: UpdateInvestigadorDto,
    @UploadedFile() foto?: Express.Multer.File
  ) {
    // Si se envió una nueva foto, validarla
    if (foto) {
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!tiposPermitidos.includes(foto.mimetype)) {
        throw new BadRequestException(
          'Solo se permiten imágenes en formato JPEG, JPG, PNG o WEBP'
        );
      }

      const maxSize = 5 * 1024 * 1024;
      if (foto.size > maxSize) {
        throw new BadRequestException('La imagen no puede superar 5MB');
      }
    }

    let driveUrl: string | undefined = undefined;
    if (foto) {
      const fileName = `PERFIL_${Date.now()}_${foto.originalname}`;
      const driveId = await this.googleDriveService.uploadFile(
        foto.buffer,
        fileName,
        foto.mimetype,
        'Perfiles/Fotos',
      );
      driveUrl = `googleDrive://${driveId}`;
    }

    return await this.investigadorService.updateInvestigador(
      id,
      updateInvestigadorDto,
      driveUrl
    );
  }


  @Patch(':id/aprobar')
  async aprobar(@Param('id', ParseIntPipe) id: number) {
    return await this.investigadorService.aprobarInvestigador(id);
  }


  @Patch(':id/rechazar')
  async rechazar(@Param('id', ParseIntPipe) id: number) {
    return await this.investigadorService.rechazarInvestigador(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.investigadorService.removeInvestigador(id);
  }


  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email y contraseña son obligatorios');
    }

    const investigador = await this.investigadorService.validatePassword(
      loginDto.email,
      loginDto.password
    );

    if (!investigador) {
      throw new BadRequestException('Credenciales inválidas');
    }

    return {
      message: 'Login exitoso',
      investigador
    };
  }
}

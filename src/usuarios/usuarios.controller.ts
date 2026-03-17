import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { GoogleDriveService } from '../google-drive/google-drive.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly googleDriveService: GoogleDriveService,
  ) { }

  @Get(':id/foto')
  async getFoto(@Param('id') id: string, @Res() res: Response) {
    const fotoUrl = await this.usuariosService.getFoto(+id);

    if (fotoUrl && typeof fotoUrl === 'string' && fotoUrl.startsWith('googleDrive://')) {
      const fileId = fotoUrl.replace('googleDrive://', '');
      const stream = await this.googleDriveService.getFileStream(fileId);
      res.set('Content-Type', 'image/jpeg');

      res.on('close', () => {
        if (stream && typeof (stream as any).destroy === 'function') {
          (stream as any).destroy();
        }
      });

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
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile() foto: Express.Multer.File
  ) {
    if (!foto) {
      throw new BadRequestException('La foto de perfil es obligatoria');
    }

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(foto.mimetype)) {
      throw new BadRequestException('Solo se permiten imágenes en formato JPEG, JPG, PNG o WEBP');
    }

    const maxSize = 5 * 1024 * 1024;
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

    return this.usuariosService.createUsuario(createUsuarioDto, `googleDrive://${driveId}`);
  }

  @Get('all')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usuariosService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto_perfil', {
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @UploadedFile() foto?: Express.Multer.File
  ) {
    let driveUrlPromise: Promise<string | undefined> = Promise.resolve(undefined);
    if (foto) {
      const fileName = `PERFIL_${Date.now()}_${foto.originalname}`;
      driveUrlPromise = this.googleDriveService.uploadFile(
        foto.buffer,
        fileName,
        foto.mimetype,
        'Perfiles/Fotos',
      ).then(id => `googleDrive://${id}`);
    }

    return driveUrlPromise.then(driveUrl => 
      this.usuariosService.updateUsuario(+id, updateUsuarioDto, driveUrl)
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.removeUsuario(+id);
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email y contraseña son obligatorios');
    }

    const usuario = await this.usuariosService.validatePassword(
      loginDto.email,
      loginDto.password
    );

    if (!usuario) {
      throw new BadRequestException('Credenciales inválidas');
    }

    return {
      message: 'Login exitoso',
      usuario
    };
  }
}

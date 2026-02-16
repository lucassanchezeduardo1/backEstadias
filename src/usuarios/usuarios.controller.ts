import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get(':id/foto')
  async getFoto(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.usuariosService.getFoto(+id);
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  }

  @Post()
  @UseInterceptors(FileInterceptor('foto_perfil'))
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

    return this.usuariosService.createUsuario(createUsuarioDto, foto.buffer);
  }

  @Get('all')
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto_perfil'))
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @UploadedFile() foto?: Express.Multer.File
  ) {
    return this.usuariosService.updateUsuario(+id, updateUsuarioDto, foto?.buffer);
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

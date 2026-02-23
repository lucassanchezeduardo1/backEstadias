import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>) { }


  async createUsuario(
    CreateUsuarioDto: CreateUsuarioDto,
    fotoBuffer: Buffer
  ) {
    try {
      // 1. Verificar si el email ya existe
      const emailExiste = await this.usuarioRepo.findOne({
        where: { email: CreateUsuarioDto.email }
      });

      if (emailExiste) {
        throw new ConflictException('El email ya está registrado');
      }

      // 4. Hashear la contraseña ANTES de guardar
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        CreateUsuarioDto.password,
        saltRounds
      );

      // 5. Crear el usuario con contraseña hasheada y foto
      const newUsuario = this.usuarioRepo.create({
        ...CreateUsuarioDto,
        password: hashedPassword, //Contraseña encriptada
        foto_perfil: fotoBuffer
      });

      // 6. Guardar en la base de datos
      const savedUsuario = await this.usuarioRepo.save(newUsuario);

      // 7. Eliminar campos sensibles de la respuesta
      const { password, foto_perfil, ...usuarioSinDatosSensibles } = savedUsuario;

      return {
        message: 'usuario registrado exitosamente.',
        usuario: usuarioSinDatosSensibles
      };

    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear usuario:', error);
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  async findAll() {
    try {
      return await this.usuarioRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  async findOne(id: number) {
    try {
      const usuario = await this.usuarioRepo.findOneBy({ id });
      if (!usuario) {
        throw new NotFoundException(`El usuario con el id: ${id} no encontrado`);
      }
      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el usuario');
    }
  }

  async updateUsuario(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
    fotoBuffer?: Buffer
  ) {
    try {
      const usuario = await this.usuarioRepo.findOneBy({ id });

      if (!usuario) {
        throw new NotFoundException(`usuario con el id: ${id} no encontrado`);
      }

      // Si se está actualizando la contraseña, hashearla
      if (updateUsuarioDto.password) {
        const saltRounds = 10;
        updateUsuarioDto.password = await bcrypt.hash(
          updateUsuarioDto.password,
          saltRounds
        );
      }

      // Si se proporciona una nueva foto, actualizarla
      const datosActualizar = {
        ...updateUsuarioDto,
        ...(fotoBuffer && { foto_perfil: fotoBuffer })
      };

      // Actualizar los datos
      const updateUsuario = this.usuarioRepo.merge(
        usuario,
        datosActualizar
      );

      const savedUsuario = await this.usuarioRepo.save(updateUsuario);

      // Eliminar campos sensibles de la respuesta
      const { password, foto_perfil, ...usuarioSinDatosSensibles } = savedUsuario;

      return usuarioSinDatosSensibles;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('SERVER ERROR IN updateUsuario:', error);
      // Si es un error de clave duplicada (ER_DUP_ENTRY)
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException('El correo electrónico ya está en uso por otro usuario');
      }
      throw new InternalServerErrorException('Error al actualizar el usuario: ' + error.message);
    }
  }

  async removeUsuario(id: number) {
    try {
      const usuario = await this.usuarioRepo.findOneBy({ id });
      if (!usuario) {
        throw new NotFoundException(`Usuario con el id: ${id} no encontrado`);
      }
      await this.usuarioRepo.remove(usuario);
      return { message: `usuario con el id: ${id} se ha eliminado` };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }

  async validatePassword(email: string, password_req: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { email }
    });

    if (!usuario) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password_req, usuario.password);

    if (!isPasswordValid) {
      return null;
    }

    // No regresar datos sensibles
    const { password, foto_perfil, ...usuarioSinDatosSensibles } = usuario;
    return usuarioSinDatosSensibles;
  }

  async getFoto(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      select: ['id', 'foto_perfil']
    });

    if (!usuario || !usuario.foto_perfil) {
      throw new NotFoundException('Foto no encontrada');
    }

    return usuario.foto_perfil;
  }
}

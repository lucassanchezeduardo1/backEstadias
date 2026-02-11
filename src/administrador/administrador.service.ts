import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { UpdateAdministradorDto } from './dto/update-administrador.dto';
import { Administrador } from './entities/administrador.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdministradorService {
  constructor(
    @InjectRepository(Administrador)
  private administradorRepo: Repository<Administrador>){ }


  async createAdministrador(createDto: CreateAdministradorDto) {
  try {
    // Cifrar contraseña antes de guardar
    const salt = await bcrypt.genSalt();
    createDto.password = await bcrypt.hash(createDto.password, salt);
    
    const newAdministrador = this.administradorRepo.create(createDto);
    await this.administradorRepo.save(newAdministrador);
    return newAdministrador;
  } catch (error) {
    throw new InternalServerErrorException('Error al crear el administrador');
  }
}

    async findAll() {
    try {
      return await this.administradorRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los administradores');
    }
  }

  async findOne(id: number) {
    try {
      const administrador = await this.administradorRepo.findOneBy({ id });
      if (!administrador) {
        throw new NotFoundException(`el administrador con el id: ${id} no encontrado`);
      }
      return administrador;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el administrador');
    }
  }

  async updateAdministrador(id: number, UpdateAdministradorDto: UpdateAdministradorDto) {
    try {
      const administrador = await this.administradorRepo.findOneBy({ id });
      if (!administrador) {
        throw new NotFoundException(`Empleado con el id: ${id} no encontrado`);
      }
      const updateAdministrador = this.administradorRepo.merge(administrador, UpdateAdministradorDto);
      return await this.administradorRepo.save(updateAdministrador);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el administrador');
    }
  }

   async removeAdministrador(id: number) {
    try {
      const administrador = await this.administradorRepo.findOneBy({id});
      if(!administrador){
        throw new NotFoundException(`Empleado con el id: ${id} no encontrado`);
      }
      await this.administradorRepo.remove(administrador);
      return {message:`administrador con el id: ${id} se ha eliminado`};

    } catch (error){
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el administrador');
    }
  }

  async login(email: string, pass: string) {
    // 1. Buscar al administrador por email en la BD
    const admin = await this.administradorRepo.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('El correo no existe');
    }
    // 2. Comparar la contraseña enviada con el hash de la BD
    const isMatch = await bcrypt.compare(pass, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }
    // 3. Retornar éxito (Lo ideal es un JWT, pero por ahora enviamos los datos)
    return {
      token: 'TOKEN_PROVISIONAL_JWT', // Aquí generarías un JWT real
      user: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email
      }
    };
  }
}

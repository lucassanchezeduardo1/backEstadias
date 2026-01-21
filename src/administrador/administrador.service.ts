import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { UpdateAdministradorDto } from './dto/update-administrador.dto';
import { Administrador } from './entities/administrador.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AdministradorService {
  constructor(
    @InjectRepository(Administrador)
  private administradorRepo: Repository<Administrador>){ }


  async createAdministrador(CreateAdministradorDto: CreateAdministradorDto) {
    try {
      const newAdministrador = this.administradorRepo.create(CreateAdministradorDto);
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
}

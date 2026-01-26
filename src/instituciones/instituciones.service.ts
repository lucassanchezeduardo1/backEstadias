import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateInstitucioneDto } from './dto/create-institucione.dto';
import { UpdateInstitucioneDto } from './dto/update-institucione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institucione } from './entities/institucione.entity';

@Injectable()
export class InstitucionesService {
  constructor(
      @InjectRepository(Institucione)
    private institucionRepo: Repository<Institucione>){ }
  
  
    async createInstitucion(CreateInstitucioneDto: CreateInstitucioneDto) {
      try {
        const newAIntitucion = this.institucionRepo.create(CreateInstitucioneDto);
        await this.institucionRepo.save(newAIntitucion);
        return newAIntitucion;
      } catch (error) {
        throw new InternalServerErrorException('Error al crear la institucion');
      }
    }
  
      async findAll() {
      try {
        return await this.institucionRepo.find();
      } catch (error) {
        throw new InternalServerErrorException('Error al obtener las instituciones');
      }
    }
  
    async findOne(id: number) {
      try {
        const institucion = await this.institucionRepo.findOneBy({ id });
        if (!institucion) {
          throw new NotFoundException(`la institucion con el id: ${id} no encontrada`);
        }
        return institucion;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error al buscar la institucion');
      }
    }
  
    async updateInatitucion(id: number, UpdateInstitucioneDto: UpdateInstitucioneDto) {
      try {
        const institucion = await this.institucionRepo.findOneBy({ id });
        if (!institucion) {
          throw new NotFoundException(`Empleado con el id: ${id} no encontrado`);
        }
        const updateInatitucion = this.institucionRepo.merge(institucion, UpdateInstitucioneDto);
        return await this.institucionRepo.save(updateInatitucion);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error al actualizar la institucion');
      }
    }
  
     async removeIstitucion(id: number) {
      try {
        const institucion = await this.institucionRepo.findOneBy({id});
        if(!institucion){
          throw new NotFoundException(`institucion con el id: ${id} no encontrada`);
        }
        await this.institucionRepo.remove(institucion);
        return {message:`institucion con el id: ${id} se ha eliminado`};
  
      } catch (error){
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error al eliminar la inatitucion');
      }
    }
}

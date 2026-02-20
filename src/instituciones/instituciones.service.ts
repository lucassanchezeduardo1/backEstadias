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
  
  
    async createInstitucion(createInstitucioneDto: CreateInstitucioneDto) {
      try {
        const newInstitucion = this.institucionRepo.create(createInstitucioneDto);
        await this.institucionRepo.save(newInstitucion);
        return newInstitucion;
      } catch (error) {
        throw new InternalServerErrorException('Error al crear la institución');
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
  
    async updateInstitucion(id: number, updateInstitucioneDto: UpdateInstitucioneDto) {
      try {
        const institucion = await this.institucionRepo.findOneBy({ id });
        if (!institucion) {
          throw new NotFoundException(`Institución con el id: ${id} no encontrada`);
        }
        const updatedInstitucion = this.institucionRepo.merge(institucion, updateInstitucioneDto);
        return await this.institucionRepo.save(updatedInstitucion);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error al actualizar la institución');
      }
    }
  
     async removeInstitucion(id: number) {
      try {
        const institucion = await this.institucionRepo.findOneBy({id});
        if(!institucion){
          throw new NotFoundException(`Institución con el id: ${id} no encontrada`);
        }
        await this.institucionRepo.remove(institucion);
        return {message:`Institución con el id: ${id} se ha eliminado`};

      } catch (error){
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error al eliminar la institución');
      }
    }
}

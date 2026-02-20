import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepo: Repository<Categoria>) { }


  async createCategoria(CreateCategoriaDto: CreateCategoriaDto) {
    try {
      const newCategoria = this.categoriaRepo.create(CreateCategoriaDto);
      await this.categoriaRepo.save(newCategoria);
      return newCategoria;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la categoria');
    }
  }

  async findAll() {
    try {
      return await this.categoriaRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las categorias');
    }
  }

  async findOne(id: number) {
    try {
      const categoria = await this.categoriaRepo.findOneBy({ id });
      if (!categoria) {
        throw new NotFoundException(`la categoria con el id: ${id} no encontrada`);
      }
      return categoria;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar la categoria');
    }
  }

  async updateCategoria(id: number, UpdateCategoriaDto: UpdateCategoriaDto) {
    try {
      const categoria = await this.categoriaRepo.findOneBy({ id });
      if (!categoria) {
        throw new NotFoundException(`Categoría con el id: ${id} no encontrada`);
      }
      const updateCategoria = this.categoriaRepo.merge(categoria, UpdateCategoriaDto);
      return await this.categoriaRepo.save(updateCategoria);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la categoria');
    }
  }

  async removeCategoria(id: number) {
    try {
      const categoria = await this.categoriaRepo.findOneBy({ id });
      if (!categoria) {
        throw new NotFoundException(`categoria con el id: ${id} no encontrada`);
      }
      await this.categoriaRepo.remove(categoria);
      return { message: `categoria con el id: ${id} se ha eliminado` };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la categoria');
    }
  }
}

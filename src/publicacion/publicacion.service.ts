import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Publicacion } from './entities/publicacion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PublicacionService {
  constructor(
    @InjectRepository(Publicacion)
    private publicacionRepo: Repository<Publicacion>) { }


  async createPublicacion(
    createPublicacionDto: CreatePublicacionDto,
    investigadorId: number //ID del investigador autenticado
  ) {
    try {
      // Crear la publicación con valores iniciales
      const newPublicacion = this.publicacionRepo.create({
        ...createPublicacionDto,
        investigador_principal: { id: investigadorId },
        categoria: { id: createPublicacionDto.categoria_id },
        sintesis_ia: null,
      });



      const savedPublicacion = await this.publicacionRepo.save(newPublicacion);

      // Generar síntesis con IA en segundo plano
      // this.generarSintesisIA(savedPublicacion.id, createPublicacionDto.pdf_url)
      //   .catch(error => console.error('Error al generar síntesis IA:', error));

      return {
        message: 'Publicación creada exitosamente',
        publicacion: savedPublicacion
      };

    } catch (error) {
      console.error('Error al crear publicación:', error);
      throw new InternalServerErrorException('Error al crear la publicación');
    }
  }

  // OBTENER TODAS LAS PUBLICACIONES
  async findAll() {
    try {
      const publicaciones = await this.publicacionRepo.find({
        order: {
          created_at: 'DESC' //Ordenar por más recientes
        }
      });

      return publicaciones;

    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      throw new InternalServerErrorException('Error al obtener las publicaciones');
    }
  }

  // OBTENER PUBLICACIONES POR CATEGORÍA
  async findByCategoria(categoriaId: number) {
    try {
      const publicaciones = await this.publicacionRepo.find({
        where: {
          categoria: {
            id: categoriaId,
          },
        },
        order: {
          created_at: 'DESC'
        }
      });

      if (publicaciones.length === 0) {
        throw new NotFoundException(`No se encontraron publicaciones para la categoría ${categoriaId}`);
      }

      return publicaciones;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al obtener publicaciones por categoría:', error);
      throw new InternalServerErrorException('Error al obtener las publicaciones por categoría');
    }
  }

  // OBTENER PUBLICACIONES DE UN INVESTIGADOR
  async findByInvestigador(investigadorId: number) {
    try {
      const publicaciones = await this.publicacionRepo.find({
        where: {
          investigador_principal: {
            id: investigadorId,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return publicaciones;

    } catch (error) {
      console.error('Error al obtener publicaciones del investigador:', error);
      throw new InternalServerErrorException(
        'Error al obtener las publicaciones del investigador',
      );
    }
  }


  // OBTENER UNA PUBLICACIÓN POR ID
  async findOne(id: number) {
    try {
      const publicacion = await this.publicacionRepo.findOne({
        where: { id }
      });

      if (!publicacion) {
        throw new NotFoundException(`La publicación con el id: ${id} no fue encontrada`);
      }

      return publicacion;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al buscar publicación:', error);
      throw new InternalServerErrorException('Error al buscar la publicación');
    }
  }

  // OBTENER Y AUMENTAR CONTADOR DE VISTAS
  async findOneAndIncrementVistas(id: number) {
    try {
      const publicacion = await this.findOne(id);

      // Incrementar contador de vistas
      await this.publicacionRepo.increment({ id }, 'vistas', 1);

      // Retornar publicación actualizada
      return await this.findOne(id);

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al incrementar vistas:', error);
      throw new InternalServerErrorException('Error al obtener la publicación');
    }
  }

  // INCREMENTAR CONTADOR DE DESCARGAS
  async incrementarDescargas(id: number) {
    try {
      const publicacion = await this.findOne(id);

      await this.publicacionRepo.increment({ id }, 'descargas', 1);

      return {
        message: 'Descarga registrada exitosamente',
        descargas: publicacion.descargas + 1
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al incrementar descargas:', error);
      throw new InternalServerErrorException('Error al registrar la descarga');
    }
  }

  // ACTUALIZAR PUBLICACIÓN
  async updatePublicacion(
  id: number,
  updatePublicacionDto: UpdatePublicacionDto,
  investigadorId: number,
) {
  try {
    const publicacion = await this.publicacionRepo.findOne({
      where: { id },
      relations: ['investigador_principal', 'categoria'],
    });

    if (!publicacion) {
      throw new NotFoundException(`Publicación con el id: ${id} no encontrada`);
    }

    if (publicacion.investigador_principal.id !== investigadorId) {
      throw new BadRequestException('No tienes permiso para editar esta publicación');
    }

    //Actualizar campos simples
    const { categoria_id, ...rest } = updatePublicacionDto;
    Object.assign(publicacion, rest);

    //Actualizar relación de categoría (IMPORTANTE)
    if (categoria_id) {
      publicacion.categoria = { id: categoria_id } as any;
    }

    const savedPublicacion = await this.publicacionRepo.save(publicacion);

    return {
      message: 'Publicación actualizada exitosamente',
      publicacion: savedPublicacion,
    };

  } catch (error) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    console.error('Error al actualizar publicación:', error);
    throw new InternalServerErrorException('Error al actualizar la publicación');
  }
}


  // ELIMINAR PUBLICACIÓN
  async removePublicacion(id: number, investigadorId: number) {
    const publicacion = await this.publicacionRepo.findOne({
      where: { id },
      relations: ['investigador_principal'],
    });

    if (!publicacion) {
      throw new NotFoundException(`Publicación con el id: ${id} no encontrada`);
    }

    if (publicacion.investigador_principal.id !== investigadorId) {
      throw new BadRequestException(
        'No tienes permiso para eliminar esta publicación',
      );
    }

    await this.publicacionRepo.remove(publicacion);

    return {
      message: `Publicación con el id: ${id} se ha eliminado correctamente`,
    };
  }


  // BUSCAR PUBLICACIONES (búsqueda de texto completo)
  async buscarPublicaciones(termino: string) {
    try {
      const publicaciones = await this.publicacionRepo
        .createQueryBuilder('publicacion')
        .where('publicacion.activa = :activa', { activa: true })
        .andWhere(
          '(publicacion.titulo LIKE :termino OR publicacion.sintesis_investigador LIKE :termino OR publicacion.sintesis_ia LIKE :termino)',
          { termino: `%${termino}%` }
        )
        .orderBy('publicacion.fecha_publicacion', 'DESC')
        .getMany();

      return publicaciones;

    } catch (error) {
      console.error('Error al buscar publicaciones:', error);
      throw new InternalServerErrorException('Error al buscar publicaciones');
    }
  }

  // OBTENER ESTADÍSTICAS DE UNA PUBLICACIÓN
  async getEstadisticas(id: number, investigadorId: number) {
    try {
      const publicacion = await this.publicacionRepo.findOne({
        where: { id },
        relations: ['investigador_principal'],
        select: ['id', 'titulo', 'vistas', 'descargas', 'created_at', 'investigador_principal']
      });

      if (!publicacion) {
        throw new NotFoundException(`Publicación con el id: ${id} no encontrada`);
      }

      // Verificar que el investigador sea el dueño
      if (publicacion.investigador_principal.id !== investigadorId) {
        throw new BadRequestException('No tienes permiso para ver las estadísticas de esta publicación');
      }

      return {
        id: publicacion.id,
        titulo: publicacion.titulo,
        vistas: publicacion.vistas,
        descargas: publicacion.descargas,
        fecha_publicacion: publicacion.created_at
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al obtener estadísticas:', error);
      throw new InternalServerErrorException('Error al obtener las estadísticas');
    }
  }

}

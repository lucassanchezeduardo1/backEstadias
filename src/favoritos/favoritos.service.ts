import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { UpdateFavoritoDto } from './dto/update-favorito.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorito } from './entities/favorito.entity';
import { Repository } from 'typeorm';
import { Publicacion } from 'src/publicacion/entities/publicacion.entity';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Favorito)
    private favoritoRepo: Repository<Favorito>,
    
    @InjectRepository(Publicacion)
    private publicacionRepo: Repository<Publicacion>
  ) {}

  async create(createFavoritoDto: CreateFavoritoDto, usuarioId: number) {
  try {
    // Verificar que la publicación existe
    const publicacion = await this.publicacionRepo.findOne({
      where: { id: createFavoritoDto.publicacion_id }
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar que no esté ya en favoritos
    const existe = await this.favoritoRepo.findOne({
      where: {
        usuario_id: usuarioId,
        publicacion_id: createFavoritoDto.publicacion_id
      }
    });

    if (existe) {
      throw new ConflictException('Esta publicación ya está en tus favoritos');
    }

    // Crear favorito
    const nuevoFavorito = this.favoritoRepo.create({
      usuario_id: usuarioId,
      publicacion_id: createFavoritoDto.publicacion_id
    });

    const savedFavorito = await this.favoritoRepo.save(nuevoFavorito);

    return {
      message: 'Publicación agregada a favoritos',
      favorito: savedFavorito
    };

  } catch (error) {
    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    console.error('Error al agregar a favoritos:', error);
    throw new InternalServerErrorException('Error al agregar a favoritos');
  }
}


  async findAll(usuarioId: number) {
    try {
      const favoritos = await this.favoritoRepo.find({
        where: { usuario_id: usuarioId },
        relations: ['publicacion', 'publicacion.investigador_principal', 'publicacion.categoria'],
        order: { created_at: 'DESC' }
      });

      return {
        total: favoritos.length,
        favoritos: favoritos.map(fav => ({
          id: fav.id,
          created_at: fav.created_at,
          publicacion: {
            id: fav.publicacion.id,
            titulo: fav.publicacion.titulo,
            imagen_portada_url: fav.publicacion.img_portada_url,
            sintesis_investigador: fav.publicacion.sintesis_investigador,
            fecha_publicacion: fav.publicacion.created_at,
            vistas: fav.publicacion.vistas,
            descargas: fav.publicacion.descargas,
            investigador: {
              id: fav.publicacion.investigador_principal.id,
              nombre: fav.publicacion.investigador_principal.nombre,
              apellidos: fav.publicacion.investigador_principal.apellidos,
              grado_academico: fav.publicacion.investigador_principal.grado_academico
            },
            categoria: {
              id: fav.publicacion.categoria.id,
              nombre: fav.publicacion.categoria.nombre
            }
          }
        }))
      };

    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      throw new InternalServerErrorException('Error al obtener favoritos');
    }
  }

  // VERIFICAR SI UNA PUBLICACIÓN ES FAVORITA
  async esFavorito(publicacionId: number, usuarioId: number) {
    try {
      const favorito = await this.favoritoRepo.findOne({
        where: {
          usuario_id: usuarioId,
          publicacion_id: publicacionId
        }
      });

      return {
        es_favorito: !!favorito,
        favorito_id: favorito?.id || null
      };

    } catch (error) {
      console.error('Error al verificar favorito:', error);
      throw new InternalServerErrorException('Error al verificar favorito');
    }
  }

  async findOne(id: number, usuarioId: number) {
    try {
      const favorito = await this.favoritoRepo.findOne({
        where: { id, usuario_id: usuarioId },
        relations: ['publicacion']
      });

      if (!favorito) {
        throw new NotFoundException('Favorito no encontrado');
      }

      return favorito;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al buscar favorito:', error);
      throw new InternalServerErrorException('Error al buscar favorito');
    }
  }

  // ELIMINAR DE FAVORITOS (por ID de favorito)
  async remove(id: number, usuarioId: number) {
    try {
      const favorito = await this.favoritoRepo.findOne({
        where: { id, usuario_id: usuarioId }
      });

      if (!favorito) {
        throw new NotFoundException('Favorito no encontrado');
      }

      await this.favoritoRepo.remove(favorito);

      return {
        message: 'Publicación eliminada de favoritos'
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al eliminar favorito:', error);
      throw new InternalServerErrorException('Error al eliminar favorito');
    }
  }

  // ELIMINAR DE FAVORITOS (por ID de publicación)
  async removeByPublicacion(publicacionId: number, usuarioId: number) {
    try {
      const favorito = await this.favoritoRepo.findOne({
        where: {
          usuario_id: usuarioId,
          publicacion_id: publicacionId
        }
      });

      if (!favorito) {
        throw new NotFoundException('Esta publicación no está en tus favoritos');
      }

      await this.favoritoRepo.remove(favorito);

      return {
        message: 'Publicación eliminada de favoritos'
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al eliminar favorito:', error);
      throw new InternalServerErrorException('Error al eliminar favorito');
    }
  }

  // TOGGLE FAVORITO (agregar o quitar)
  async toggle(publicacionId: number, usuarioId: number) {
    try {
      const existe = await this.favoritoRepo.findOne({
        where: {
          usuario_id: usuarioId,
          publicacion_id: publicacionId
        }
      });

      if (existe) {
        // Si existe, eliminarlo
        await this.favoritoRepo.remove(existe);
        return {
          message: 'Publicación eliminada de favoritos',
          es_favorito: false
        };
      } else {
        // Si no existe, agregarlo
        const publicacion = await this.publicacionRepo.findOne({
          where: { id: publicacionId }
        });

        if (!publicacion) {
          throw new NotFoundException('Publicación no encontrada');
        }

        const nuevoFavorito = this.favoritoRepo.create({
          usuario_id: usuarioId,
          publicacion_id: publicacionId
        });

        await this.favoritoRepo.save(nuevoFavorito);

        return {
          message: 'Publicación agregada a favoritos',
          es_favorito: true
        };
      }

    } catch (error) {
      if (
        error instanceof NotFoundException || 
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error al cambiar favorito:', error);
      throw new InternalServerErrorException('Error al cambiar favorito');
    }
  }

  // OBTENER ESTADÍSTICAS DE FAVORITOS
  async getEstadisticas(usuarioId: number) {
    try {
      const total = await this.favoritoRepo.count({
        where: { usuario_id: usuarioId }
      });

      const categoriasMasFavoritas = await this.favoritoRepo
        .createQueryBuilder('favorito')
        .innerJoin('favorito.publicacion', 'publicacion')
        .innerJoin('publicacion.categoria', 'categoria')
        .select('categoria.nombre', 'categoria')
        .addSelect('COUNT(*)', 'total')
        .where('favorito.usuario_id = :usuarioId', { usuarioId })
        .groupBy('categoria.id')
        .orderBy('total', 'DESC')
        .limit(5)
        .getRawMany();

      return {
        total_favoritos: total,
        categorias_favoritas: categoriasMasFavoritas
      };

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new InternalServerErrorException('Error al obtener estadísticas');
    }
  }
}

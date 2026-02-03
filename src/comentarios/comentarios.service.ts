import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comentario } from './entities/comentario.entity';
import { Repository } from 'typeorm';
import { Publicacion } from 'src/publicacion/entities/publicacion.entity';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectRepository(Comentario)
    private comentarioRepo: Repository<Comentario>,
    
    @InjectRepository(Publicacion)
    private publicacionRepo: Repository<Publicacion>
  ) {}

  async create(
    createComentarioDto: CreateComentarioDto,
    usuarioId: number // Del token JWT
  ) {
    try {
      // Verificar que la publicación existe
      const publicacion = await this.publicacionRepo.findOne({
        where: { id: createComentarioDto.publicacion_id }
      });

      if (!publicacion) {
        throw new NotFoundException('Publicación no encontrada');
      }

      // Crear el comentario
      const nuevoComentario = this.comentarioRepo.create({
        ...createComentarioDto,
        usuario_id: usuarioId,
        leido: false
      });

      const savedComentario = await this.comentarioRepo.save(nuevoComentario);

      return {
        message: 'Comentario enviado exitosamente al investigador',
        comentario: savedComentario
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al crear comentario:', error);
      throw new InternalServerErrorException('Error al crear el comentario');
    }
  }
  // OBTENER COMENTARIOS DE UNA PUBLICACIÓN (solo el investigador autor)
  async findByPublicacion(publicacionId: number, investigadorId: number) {
    try {
      // Verificar que la publicación existe y pertenece al investigador
      const publicacion = await this.publicacionRepo.findOne({
        where: { id: publicacionId }
      });

      if (!publicacion) {
        throw new NotFoundException('Publicación no encontrada');
      }

      if (publicacion.investigador_principal_id !== investigadorId) {
        throw new BadRequestException('No tienes permiso para ver estos comentarios');
      }

      // Obtener comentarios con información del usuario
      const comentarios = await this.comentarioRepo.find({
        where: { publicacion_id: publicacionId },
        relations: ['usuario'], // Cargar info del usuario
        order: { created_at: 'DESC' }
      });

      return comentarios;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al obtener comentarios:', error);
      throw new InternalServerErrorException('Error al obtener los comentarios');
    }
  }

  // OBTENER COMENTARIOS NO LEÍDOS (investigador)
  async findNoLeidos(investigadorId: number) {
    try {
      const comentarios = await this.comentarioRepo
        .createQueryBuilder('comentario')
        .innerJoin('comentario.publicacion', 'publicacion')
        .innerJoinAndSelect('comentario.usuario', 'usuario')
        .where('publicacion.investigador_principal_id = :investigadorId', { investigadorId })
        .andWhere('comentario.leido = :leido', { leido: false })
        .orderBy('comentario.created_at', 'DESC')
        .getMany();

      return {
        total: comentarios.length,
        comentarios
      };

    } catch (error) {
      console.error('Error al obtener comentarios no leídos:', error);
      throw new InternalServerErrorException('Error al obtener comentarios no leídos');
    }
  }

  // MARCAR COMENTARIO COMO LEÍDO
  async marcarComoLeido(id: number, investigadorId: number) {
    try {
      const comentario = await this.comentarioRepo.findOne({
        where: { id },
        relations: ['publicacion']
      });

      if (!comentario) {
        throw new NotFoundException('Comentario no encontrado');
      }

      // Verificar que sea el investigador dueño de la publicación
      if (comentario.publicacion.investigador_principal_id !== investigadorId) {
        throw new BadRequestException('No tienes permiso para marcar este comentario');
      }

      comentario.leido = true;
      await this.comentarioRepo.save(comentario);

      return {
        message: 'Comentario marcado como leído'
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al marcar comentario:', error);
      throw new InternalServerErrorException('Error al marcar el comentario como leído');
    }
  }

  // ELIMINAR COMENTARIO (investigador)
  async remove(id: number, investigadorId: number) {
    try {
      const comentario = await this.comentarioRepo.findOne({
        where: { id },
        relations: ['publicacion']
      });

      if (!comentario) {
        throw new NotFoundException('Comentario no encontrado');
      }

      // Verificar que sea el investigador dueño de la publicación
      if (comentario.publicacion.investigador_principal_id !== investigadorId) {
        throw new BadRequestException('No tienes permiso para eliminar este comentario');
      }

      await this.comentarioRepo.remove(comentario);

      return {
        message: 'Comentario eliminado exitosamente'
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al eliminar comentario:', error);
      throw new InternalServerErrorException('Error al eliminar el comentario');
    }
  }
}

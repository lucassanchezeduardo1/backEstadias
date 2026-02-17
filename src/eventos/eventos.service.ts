import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Evento, ModalidadEvento } from './entities/evento.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private eventoRepo: Repository<Evento>
  ) { }

  async create(
    createEventoDto: CreateEventoDto,
    investigadorId: number,
    imagenBuffer: Buffer
  ) {
    try {
      // Validar que la fecha sea futura o hoy
      const fechaEvento = new Date(createEventoDto.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaEvento < hoy) {
        throw new BadRequestException('La fecha del evento no puede ser en el pasado');
      }

      // Validar URL para eventos virtuales
      if (
        (createEventoDto.modalidad === 'virtual' || createEventoDto.modalidad === 'hibrida') &&
        !createEventoDto.lugar_enlace.startsWith('http')
      ) {
        throw new BadRequestException(
          'Para eventos virtuales o híbridos, debe proporcionar un enlace válido (URL)'
        );
      }

      const modalidadEnum = createEventoDto.modalidad as ModalidadEvento;

      // Crear el evento
      const nuevoEvento = this.eventoRepo.create({
        titulo: createEventoDto.titulo,
        imagen_principal: imagenBuffer, // ⬅️ Buffer de la imagen
        descripcion: createEventoDto.descripcion,
        tipo_evento: createEventoDto.tipo_evento,
        investigador_organizador_id: investigadorId,
        fecha: new Date(createEventoDto.fecha),
        hora: createEventoDto.hora,
        modalidad: modalidadEnum,
        lugar_enlace: createEventoDto.lugar_enlace,
        categoria_id: createEventoDto.categoria_id,
        ponentes: createEventoDto.ponentes,
        publico_objetivo: createEventoDto.publico_objetivo
      });

      const savedEvento = await this.eventoRepo.save(nuevoEvento);

      // Eliminar imagen de la respuesta (es muy pesada)
      const { imagen_principal, ...eventoSinImagen } = savedEvento;

      return {
        message: 'Evento creado exitosamente',
        evento: eventoSinImagen
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear evento:', error);
      throw new InternalServerErrorException('Error al crear el evento');
    }
  }

  // ============================================
  // OBTENER IMAGEN DEL EVENTO
  // ============================================
  async getImagen(id: number): Promise<Buffer> {
    try {
      const evento = await this.eventoRepo.findOne({
        where: { id },
        select: ['imagen_principal']
      });

      if (!evento || !evento.imagen_principal) {
        throw new NotFoundException('Imagen del evento no encontrada');
      }

      return evento.imagen_principal;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al obtener imagen:', error);
      throw new InternalServerErrorException('Error al obtener la imagen');
    }
  }

  // ============================================
  // OBTENER TODOS LOS EVENTOS (sin imágenes)
  // ============================================
  async findAll() {
    try {
      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
        .select([
          'evento.id',
          'evento.titulo',
          'evento.descripcion',
          'evento.tipo_evento',
          'evento.fecha',
          'evento.hora',
          'evento.modalidad',
          'evento.lugar_enlace',
          'evento.ponentes',
          'evento.publico_objetivo',
          'evento.created_at',
          // 'evento.imagen_principal', // EXCLUDED
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          // 'investigador.foto_perfil', // EXCLUDED
          'categoria.id',
          'categoria.nombre'
        ])
        .orderBy('evento.fecha', 'ASC')
        .addOrderBy('evento.hora', 'ASC')
        .getMany();

      return eventos;

    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw new InternalServerErrorException('Error al obtener los eventos');
    }
  }

  // ============================================
  // OBTENER EVENTOS PRÓXIMOS
  // ============================================
  async findProximos() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
        .select([
          'evento.id',
          'evento.titulo',
          'evento.descripcion',
          'evento.tipo_evento',
          'evento.fecha',
          'evento.hora',
          'evento.modalidad',
          'evento.lugar_enlace',
          'evento.ponentes',
          'evento.publico_objetivo',
          // 'evento.imagen_principal', // EXCLUDED
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          // 'investigador.foto_perfil', // EXCLUDED
          'categoria.id',
          'categoria.nombre'
        ])
        .where('evento.fecha >= :hoy', { hoy })
        .orderBy('evento.fecha', 'ASC')
        .addOrderBy('evento.hora', 'ASC')
        .getMany();

      return {
        total: eventos.length,
        eventos
      };

    } catch (error) {
      console.error('Error al obtener eventos próximos:', error);
      throw new InternalServerErrorException('Error al obtener los eventos próximos');
    }
  }

  // ============================================
  // OBTENER EVENTOS PASADOS
  // ============================================
  async findPasados() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
        .select([
          'evento.id',
          'evento.titulo',
          'evento.descripcion',
          'evento.tipo_evento',
          'evento.fecha',
          'evento.hora',
          'evento.modalidad',
          'evento.lugar_enlace',
          // 'evento.imagen_principal', // EXCLUDED
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          // 'investigador.foto_perfil', // EXCLUDED
          'categoria.id',
          'categoria.nombre'
        ])
        .where('evento.fecha < :hoy', { hoy })
        .orderBy('evento.fecha', 'DESC')
        .addOrderBy('evento.hora', 'DESC')
        .getMany();

      return {
        total: eventos.length,
        eventos
      };

    } catch (error) {
      console.error('Error al obtener eventos pasados:', error);
      throw new InternalServerErrorException('Error al obtener los eventos pasados');
    }
  }

  // ============================================
  // OBTENER POR CATEGORÍA
  // ============================================
  async findByCategoria(categoriaId: number) {
    try {
      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
        .select([
          'evento.id',
          'evento.titulo',
          'evento.descripcion',
          'evento.fecha',
          'evento.hora',
          'evento.modalidad',
          'evento.lugar_enlace',
          // 'evento.imagen_principal', // EXCLUDED
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          // 'investigador.foto_perfil', // EXCLUDED
          'categoria.id',
          'categoria.nombre'
        ])
        .where('evento.categoria_id = :categoriaId', { categoriaId })
        .orderBy('evento.fecha', 'ASC')
        .getMany();

      if (eventos.length === 0) {
        throw new NotFoundException(`No se encontraron eventos para la categoría ${categoriaId}`);
      }

      return eventos;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al obtener eventos por categoría:', error);
      throw new InternalServerErrorException('Error al obtener los eventos por categoría');
    }
  }

  // ============================================
  // OBTENER POR MODALIDAD
  // ============================================
  async findByModalidad(modalidad: 'presencial' | 'virtual' | 'hibrida') {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const modalidadEnum = modalidad as ModalidadEvento;

      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
        .select([
          'evento.id',
          'evento.titulo',
          'evento.descripcion',
          'evento.fecha',
          'evento.hora',
          'evento.modalidad',
          'evento.lugar_enlace',
          // 'evento.imagen_principal', // EXCLUDED
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          // 'investigador.foto_perfil', // EXCLUDED
          'categoria.id',
          'categoria.nombre'
        ])
        .where('evento.modalidad = :modalidad', { modalidad: modalidadEnum })
        .andWhere('evento.fecha >= :hoy', { hoy })
        .orderBy('evento.fecha', 'ASC')
        .getMany();

      return {
        modalidad,
        total: eventos.length,
        eventos
      };

    } catch (error) {
      console.error('Error al obtener eventos por modalidad:', error);
      throw new InternalServerErrorException('Error al obtener los eventos por modalidad');
    }
  }

  // ============================================
  // OBTENER POR INVESTIGADOR
  // ============================================
  async findByInvestigador(investigadorId: number) {
    try {
      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.categoria', 'categoria')
        .select([
          'evento.id',
          'evento.titulo',
          'evento.descripcion',
          'evento.fecha',
          'evento.hora',
          'evento.modalidad',
          'evento.lugar_enlace',
          // 'evento.imagen_principal', // EXCLUDED
          'categoria.id',
          'categoria.nombre'
        ])
        .where('evento.investigador_organizador_id = :investigadorId', { investigadorId })
        .orderBy('evento.fecha', 'DESC')
        .getMany();

      return {
        total: eventos.length,
        eventos
      };

    } catch (error) {
      console.error('Error al obtener eventos del investigador:', error);
      throw new InternalServerErrorException('Error al obtener los eventos del investigador');
    }
  }

  // ============================================
  // OBTENER UNO POR ID
  // ============================================
  async findOne(id: number) {
    try {
      const evento = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
        .select([
          'evento.id',
          'evento.titulo',
          'evento.descripcion',
          'evento.tipo_evento',
          'evento.fecha',
          'evento.hora',
          'evento.modalidad',
          'evento.lugar_enlace',
          'evento.ponentes',
          'evento.publico_objetivo',
          'evento.created_at',
          'evento.updated_at',
          // 'evento.imagen_principal', // EXCLUDED, use getImagen if needed
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          // 'investigador.foto_perfil', // EXCLUDED
          'categoria.id',
          'categoria.nombre'
        ])
        .where('evento.id = :id', { id })
        .getOne();

      if (!evento) {
        throw new NotFoundException(`El evento con el id: ${id} no fue encontrado`);
      }

      return evento;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al buscar evento:', error);
      throw new InternalServerErrorException('Error al buscar el evento');
    }
  }

  // ============================================
  // ACTUALIZAR EVENTO
  // ============================================
  async update(
    id: number,
    updateEventoDto: UpdateEventoDto,
    investigadorId: number,
    imagenBuffer?: Buffer
  ) {
    try {
      const evento = await this.eventoRepo.findOneBy({ id });

      if (!evento) {
        throw new NotFoundException(`Evento con el id: ${id} no encontrado`);
      }

      if (evento.investigador_organizador_id !== investigadorId) {
        throw new BadRequestException('No tienes permiso para editar este evento');
      }

      // Actualizar campos (solo si vienen en el DTO)
      if (updateEventoDto.titulo !== undefined) evento.titulo = updateEventoDto.titulo;
      if (updateEventoDto.descripcion !== undefined) evento.descripcion = updateEventoDto.descripcion;
      if (updateEventoDto.tipo_evento !== undefined) evento.tipo_evento = updateEventoDto.tipo_evento;
      if (updateEventoDto.fecha !== undefined) {
        evento.fecha = new Date(updateEventoDto.fecha);
        // Validar fecha solo si se actualiza
        const fechaEvento = new Date(updateEventoDto.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaEvento < hoy) {
          // throw new BadRequestException('La fecha del evento no puede ser en el pasado');
        }
      }
      if (updateEventoDto.hora !== undefined) evento.hora = updateEventoDto.hora;
      if (updateEventoDto.modalidad !== undefined) evento.modalidad = updateEventoDto.modalidad as ModalidadEvento;
      if (updateEventoDto.lugar_enlace !== undefined) evento.lugar_enlace = updateEventoDto.lugar_enlace;
      if (updateEventoDto.categoria_id !== undefined) evento.categoria_id = updateEventoDto.categoria_id;
      if (updateEventoDto.ponentes !== undefined) evento.ponentes = updateEventoDto.ponentes;
      if (updateEventoDto.publico_objetivo !== undefined) evento.publico_objetivo = updateEventoDto.publico_objetivo;

      // Actualizar imagen si se proporciona
      if (imagenBuffer) {
        evento.imagen_principal = imagenBuffer;
      }

      const savedEvento = await this.eventoRepo.save(evento);

      // Eliminar imagen de la respuesta
      const { imagen_principal, ...eventoSinImagen } = savedEvento;

      return {
        message: 'Evento actualizado exitosamente',
        evento: eventoSinImagen
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al actualizar evento:', error);
      throw new InternalServerErrorException('Error al actualizar el evento');
    }
  }

  // ============================================
  // ELIMINAR EVENTO
  // ============================================
  async remove(id: number, investigadorId: number) {
    try {
      const evento = await this.eventoRepo.findOneBy({ id });

      if (!evento) {
        throw new NotFoundException(`Evento con el id: ${id} no encontrado`);
      }

      if (evento.investigador_organizador_id !== investigadorId) {
        throw new BadRequestException('No tienes permiso para eliminar este evento');
      }

      await this.eventoRepo.remove(evento);

      return {
        message: `Evento con el id: ${id} se ha eliminado correctamente`
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al eliminar evento:', error);
      throw new InternalServerErrorException('Error al eliminar el evento');
    }
  }

  // ============================================
  // BUSCAR EVENTOS
  // ============================================
  async buscar(termino: string) {
    try {
      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
        .select([
          'evento.id',
          'evento.titulo',
          'evento.descripcion',
          'evento.fecha',
          'evento.hora',
          'evento.modalidad',
          // 'evento.imagen_principal', // EXCLUDED
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          // 'investigador.foto_perfil', // EXCLUDED
          'categoria.id',
          'categoria.nombre'
        ])
        .where(
          '(evento.titulo LIKE :termino OR evento.descripcion LIKE :termino OR evento.ponentes LIKE :termino)',
          { termino: `%${termino}%` }
        )
        .orderBy('evento.fecha', 'ASC')
        .getMany();

      return {
        termino,
        total: eventos.length,
        eventos
      };

    } catch (error) {
      console.error('Error al buscar eventos:', error);
      throw new InternalServerErrorException('Error al buscar eventos');
    }
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================
  async getEstadisticas() {
    try {
      const total = await this.eventoRepo.count();

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const proximos = await this.eventoRepo.count({
        where: { fecha: MoreThanOrEqual(hoy) }
      });

      const pasados = await this.eventoRepo.count({
        where: { fecha: LessThanOrEqual(hoy) }
      });

      const porModalidad = await this.eventoRepo
        .createQueryBuilder('evento')
        .select('evento.modalidad', 'modalidad')
        .addSelect('COUNT(*)', 'total')
        .groupBy('evento.modalidad')
        .getRawMany();

      const porCategoria = await this.eventoRepo
        .createQueryBuilder('evento')
        .innerJoin('evento.categoria', 'categoria')
        .select('categoria.nombre', 'categoria')
        .addSelect('COUNT(*)', 'total')
        .groupBy('categoria.id')
        .orderBy('total', 'DESC')
        .limit(5)
        .getRawMany();

      return {
        total,
        proximos,
        pasados,
        por_modalidad: porModalidad,
        categorias_mas_populares: porCategoria
      };

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new InternalServerErrorException('Error al obtener estadísticas');
    }
  }
}

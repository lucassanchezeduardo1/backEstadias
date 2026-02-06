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
  ) {}

  async create(
    createEventoDto: CreateEventoDto,
    investigadorId: number
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

      // ⬇️ CONVERTIR modalidad string a enum
      const modalidadEnum = createEventoDto.modalidad as ModalidadEvento;

      // Crear el evento
      const nuevoEvento = this.eventoRepo.create({
        titulo: createEventoDto.titulo,
        imagen_principal_url: createEventoDto.imagen_principal_url,
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

      return {
        message: 'Evento creado exitosamente',
        evento: savedEvento
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear evento:', error);
      throw new InternalServerErrorException('Error al crear el evento');
    }
  }

  async findAll() {
    try {
      const eventos = await this.eventoRepo.find({
        relations: ['investigador_organizador', 'categoria'],
        order: { fecha: 'ASC', hora: 'ASC' }
      });

      return eventos;

    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw new InternalServerErrorException('Error al obtener los eventos');
    }
  }

  // OBTENER EVENTOS PRÓXIMOS (a partir de hoy)
  async findProximos() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const eventos = await this.eventoRepo.find({
        where: {
          fecha: MoreThanOrEqual(hoy)
        },
        relations: ['investigador_organizador', 'categoria'],
        order: { fecha: 'ASC', hora: 'ASC' }
      });

      return {
        total: eventos.length,
        eventos
      };

    } catch (error) {
      console.error('Error al obtener eventos próximos:', error);
      throw new InternalServerErrorException('Error al obtener los eventos próximos');
    }
  }

  // OBTENER EVENTOS PASADOS
  async findPasados() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const eventos = await this.eventoRepo.find({
        where: {
          fecha: LessThanOrEqual(hoy)
        },
        relations: ['investigador_organizador', 'categoria'],
        order: { fecha: 'DESC', hora: 'DESC' }
      });

      return {
        total: eventos.length,
        eventos
      };

    } catch (error) {
      console.error('Error al obtener eventos pasados:', error);
      throw new InternalServerErrorException('Error al obtener los eventos pasados');
    }
  }

  // OBTENER EVENTOS POR CATEGORÍA
  async findByCategoria(categoriaId: number) {
    try {
      const eventos = await this.eventoRepo.find({
        where: { categoria_id: categoriaId },
        relations: ['investigador_organizador', 'categoria'],
        order: { fecha: 'ASC' }
      });

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


  // OBTENER EVENTOS POR MODALIDAD
 async findByModalidad(modalidad: 'presencial' | 'virtual' | 'hibrida') {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Convertir string a enum
      const modalidadEnum = modalidad as ModalidadEvento;

      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
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

  // OBTENER EVENTOS DE UN INVESTIGADOR
  async findByInvestigador(investigadorId: number) {
    try {
      const eventos = await this.eventoRepo.find({
        where: { investigador_organizador_id: investigadorId },
        relations: ['categoria'],
        order: { fecha: 'DESC' }
      });

      return {
        total: eventos.length,
        eventos
      };

    } catch (error) {
      console.error('Error al obtener eventos del investigador:', error);
      throw new InternalServerErrorException('Error al obtener los eventos del investigador');
    }
  }

  // OBTENER UN EVENTO POR ID
  async findOne(id: number) {
    try {
      const evento = await this.eventoRepo.findOne({
        where: { id },
        relations: ['investigador_organizador', 'categoria']
      });

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

  // ACTUALIZAR EVENTO
  async update(
    id: number,
    updateEventoDto: UpdateEventoDto,
    investigadorId: number
  ) {
    try {
      const evento = await this.eventoRepo.findOneBy({ id });

      if (!evento) {
        throw new NotFoundException(`Evento con el id: ${id} no encontrado`);
      }

      if (evento.investigador_organizador_id !== investigadorId) {
        throw new BadRequestException('No tienes permiso para editar este evento');
      }

      // Si se actualiza la fecha, validar que sea futura
      if (updateEventoDto.fecha) {
        const fechaEvento = new Date(updateEventoDto.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaEvento < hoy) {
          throw new BadRequestException('La fecha del evento no puede ser en el pasado');
        }
      }

      // ⬇️ Preparar datos para actualizar
      const datosActualizar: any = { ...updateEventoDto };
      
      if (updateEventoDto.fecha) {
        datosActualizar.fecha = new Date(updateEventoDto.fecha);
      }
      
      if (updateEventoDto.modalidad) {
        datosActualizar.modalidad = updateEventoDto.modalidad as ModalidadEvento;
      }

      const eventoActualizado = this.eventoRepo.merge(evento, datosActualizar);
      const savedEvento = await this.eventoRepo.save(eventoActualizado);

      return {
        message: 'Evento actualizado exitosamente',
        evento: savedEvento
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al actualizar evento:', error);
      throw new InternalServerErrorException('Error al actualizar el evento');
    }
  }

  // ELIMINAR EVENTO
  async remove(id: number, investigadorId: number) {
    try {
      const evento = await this.eventoRepo.findOneBy({ id });

      if (!evento) {
        throw new NotFoundException(`Evento con el id: ${id} no encontrado`);
      }

      // Verificar que el investigador sea el organizador
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

  // BUSCAR EVENTOS (por título o descripción)
  async buscar(termino: string) {
    try {
      const eventos = await this.eventoRepo
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.investigador_organizador', 'investigador')
        .leftJoinAndSelect('evento.categoria', 'categoria')
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

  // OBTENER ESTADÍSTICAS DE EVENTOS
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

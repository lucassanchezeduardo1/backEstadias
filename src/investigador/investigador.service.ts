import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateInvestigadorDto } from './dto/create-investigador.dto';
import { UpdateInvestigadorDto } from './dto/update-investigador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Investigador } from './entities/investigador.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InvestigadorService {
  constructor(
    @InjectRepository(Investigador)
    private investigadorRepo: Repository<Investigador>) { }


  async createInvestigador(
    createInvestigadorDto: CreateInvestigadorDto,
    fotoBuffer: Buffer
  ) {
    try {
      // 1. Verificar si el email ya existe
      const emailExiste = await this.investigadorRepo.findOne({
        where: { email: createInvestigadorDto.email }
      });

      if (emailExiste) {
        throw new ConflictException('El email ya está registrado');
      }

      // 2. Verificar si la matrícula ya existe
      const matriculaExiste = await this.investigadorRepo.findOne({
        where: { matricula: createInvestigadorDto.matricula }
      });

      if (matriculaExiste) {
        throw new ConflictException('La matrícula ya está registrada');
      }

      // 3. Verificar que se haya proporcionado la foto
      if (!fotoBuffer) {
        throw new BadRequestException('La foto de perfil es obligatoria');
      }

      // 4. Hashear la contraseña ANTES de guardar
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        createInvestigadorDto.password,
        saltRounds
      );

      // 5. Crear el investigador con contraseña hasheada y foto
      const newInvestigador = this.investigadorRepo.create({
        ...createInvestigadorDto,
        password: hashedPassword, //Contraseña encriptada
        foto_perfil: fotoBuffer,  //Buffer de la imagen
        estado: 'pendiente'       //Estado inicial
      });

      // 6. Guardar en la base de datos
      const savedInvestigador = await this.investigadorRepo.save(newInvestigador);

      // 7. Eliminar campos sensibles de la respuesta
      const { password, foto_perfil, ...investigadorSinDatosSensibles } = savedInvestigador;

      return {
        message: 'Investigador registrado exitosamente. Espera la aprobación del administrador.',
        investigador: investigadorSinDatosSensibles
      };

    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al crear investigador:', error);
      throw new InternalServerErrorException('Error al crear el investigador');
    }
  }

  async findAll() {
    try {
      return await this.investigadorRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los investigadores');
    }
  }

  async findAllAprobados() {
    try {
      const investigadores = await this.investigadorRepo.createQueryBuilder('investigador')
        .select([
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          'investigador.grado_academico',
          'investigador.cargo_actual',
          'investigador.direccion_oficina',
          'investigador.horario_atencion',
          'investigador.email',
          'investigador.matricula',
          'investigador.institucion_id',
          'investigador.google_academico_url',
          'investigador.descripcion_trayectoria',
          'investigador.areas_investigacion',
          'investigador.estado',
          'investigador.created_at'
        ])
        .where('investigador.estado = :estado', { estado: 'aprobado' })
        .loadRelationCountAndMap('investigador.num_publicaciones', 'investigador.publicaciones')
        .loadRelationCountAndMap('investigador.num_eventos', 'investigador.eventos')
        .getMany();

      return investigadores;

    } catch (error) {
      console.error('Error al obtener investigadores aprobados:', error);
      throw new InternalServerErrorException('Error al obtener los investigadores aprobados');
    }
  }

  async findAllPendientes() {
    try {
      const investigadores = await this.investigadorRepo.find({
        where: { estado: 'pendiente' },
        select: [
          'id',
          'nombre',
          'apellidos',
          'grado_academico',
          'email',
          'matricula',
          'institucion_id',
          'created_at'
        ]
      });

      return investigadores;

    } catch (error) {
      console.error('Error al obtener investigadores pendientes:', error);
      throw new InternalServerErrorException('Error al obtener los investigadores pendientes');
    }
  }

  async findOne(id: number) {
    try {
      const investigador = await this.investigadorRepo.createQueryBuilder('investigador')
        .leftJoinAndSelect('investigador.institucion', 'institucion')
        .select([
          'investigador.id',
          'investigador.nombre',
          'investigador.apellidos',
          'investigador.grado_academico',
          'investigador.cargo_actual',
          'investigador.direccion_oficina',
          'investigador.horario_atencion',
          'investigador.email',
          'investigador.matricula',
          'investigador.institucion_id',
          'investigador.google_academico_url',
          'investigador.researchgate_url',
          'investigador.descripcion_trayectoria',
          'investigador.areas_investigacion',
          'investigador.estado',
          'investigador.created_at',
          'investigador.updated_at',
          'institucion.id',
          'institucion.nombre'
        ])
        .where('investigador.id = :id', { id })
        .loadRelationCountAndMap('investigador.num_publicaciones', 'investigador.publicaciones')
        .loadRelationCountAndMap('investigador.num_eventos', 'investigador.eventos')
        .getOne();

      if (!investigador) {
        throw new NotFoundException(`Investigador con el id: ${id} no encontrado`);
      }

      return investigador;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al buscar investigador:', error);
      throw new InternalServerErrorException('Error al buscar el investigador');
    }
  }

  async updateInvestigador(
    id: number,
    updateInvestigadorDto: UpdateInvestigadorDto,
    fotoBuffer?: Buffer
  ) {
    try {
      const investigador = await this.investigadorRepo.findOneBy({ id });

      if (!investigador) {
        throw new NotFoundException(`Investigador con el id: ${id} no encontrado`);
      }

      // Si se está actualizando la contraseña, hashearla
      if (updateInvestigadorDto.password) {
        const saltRounds = 10;
        updateInvestigadorDto.password = await bcrypt.hash(
          updateInvestigadorDto.password,
          saltRounds
        );
      }

      // Si se proporciona una nueva foto, actualizarla
      const datosActualizar = {
        ...updateInvestigadorDto,
        ...(fotoBuffer && { foto_perfil: fotoBuffer })
      };

      // Actualizar los datos
      const updateInvestigador = this.investigadorRepo.merge(
        investigador,
        datosActualizar
      );

      const savedInvestigador = await this.investigadorRepo.save(updateInvestigador);

      // Eliminar campos sensibles de la respuesta
      const { password, foto_perfil, ...investigadorSinDatosSensibles } = savedInvestigador;

      return investigadorSinDatosSensibles;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al actualizar investigador:', error);
      throw new InternalServerErrorException('Error al actualizar el investigador');
    }
  }

  // APROBAR INVESTIGADOR (solo admin)
  async aprobarInvestigador(id: number) {
    try {
      const investigador = await this.investigadorRepo.findOneBy({ id });

      if (!investigador) {
        throw new NotFoundException(`Investigador con el id: ${id} no encontrado`);
      }

      if (investigador.estado !== 'pendiente') {
        throw new BadRequestException('El investigador ya fue procesado');
      }

      investigador.estado = 'aprobado';

      await this.investigadorRepo.save(investigador);

      return {
        message: 'Investigador aprobado exitosamente',
        investigador: {
          id: investigador.id,
          nombre: investigador.nombre,
          apellidos: investigador.apellidos,
          email: investigador.email,
          estado: investigador.estado
        }
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al aprobar investigador:', error);
      throw new InternalServerErrorException('Error al aprobar el investigador');
    }
  }


  // RECHAZAR INVESTIGADOR (solo admin)
  async rechazarInvestigador(id: number) {
    try {
      const investigador = await this.investigadorRepo.findOneBy({ id });

      if (!investigador) {
        throw new NotFoundException(`Investigador con el id: ${id} no encontrado`);
      }

      if (investigador.estado !== 'pendiente') {
        throw new BadRequestException('El investigador ya fue procesado');
      }

      investigador.estado = 'rechazado';

      await this.investigadorRepo.save(investigador);

      return {
        message: 'Investigador rechazado',
        investigador: {
          id: investigador.id,
          nombre: investigador.nombre,
          apellidos: investigador.apellidos,
          email: investigador.email,
          estado: investigador.estado
        }
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al rechazar investigador:', error);
      throw new InternalServerErrorException('Error al rechazar el investigador');
    }
  }

  async removeInvestigador(id: number) {
    try {
      const investigador = await this.investigadorRepo.findOneBy({ id });
      if (!investigador) {
        throw new NotFoundException(`investigador con el id: ${id} no encontrado`);
      }
      await this.investigadorRepo.remove(investigador);
      return { message: `investigador con el id: ${id} se ha eliminado` };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el investigador');
    }
  }

  // VALIDAR PASSWORD (para login)
  async validatePassword(email: string, password: string): Promise<Investigador | null> {
    try {
      // Buscar investigador por email (INCLUYENDO password)
      const investigador = await this.investigadorRepo.findOne({
        where: { email },
        select: ['id', 'nombre', 'apellidos', 'email', 'password', 'estado']
      });

      if (!investigador) {
        return null;
      }

      // Verificar que esté aprobado
      if (investigador.estado !== 'aprobado') {
        throw new BadRequestException(
          'Tu cuenta aún no ha sido aprobada por el administrador. Por favor espera.'
        );
      }

      // Comparar contraseña
      const passwordValido = await bcrypt.compare(password, investigador.password);

      if (!passwordValido) {
        return null;
      }

      // Eliminar password antes de retornar
      const { password: _, ...investigadorSinPassword } = investigador;

      return investigadorSinPassword as Investigador;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al validar credenciales:', error);
      throw new InternalServerErrorException('Error al validar credenciales');
    }
  }

  async getFoto(id: number) {
    const investigador = await this.investigadorRepo.findOne({
      where: { id },
      select: ['id', 'foto_perfil']
    });

    if (!investigador || !investigador.foto_perfil) {
      throw new NotFoundException('Foto no encontrada');
    }

    return investigador.foto_perfil;
  }
}

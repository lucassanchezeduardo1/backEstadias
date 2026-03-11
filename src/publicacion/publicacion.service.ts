import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Publicacion } from './entities/publicacion.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';


import { GoogleDriveService } from '../google-drive/google-drive.service';


@Injectable()
export class PublicacionService {
  constructor(
    @InjectRepository(Publicacion)
    private publicacionRepo: Repository<Publicacion>,
    private googleDriveService: GoogleDriveService,
  ) { }


  async create(
    createDto: CreatePublicacionDto,
    imgPortadaBuffer: Buffer,
    imgContenidoBuffer: Buffer | null,
    pdfUrl: string,
  ) {
    try {
      const publicacion = this.publicacionRepo.create({
        titulo: createDto.titulo,
        sub_categoria: createDto.sub_categoria,
        colaboradores: createDto.colaboradores,
        descripcion_investigacion: createDto.descripcion_investigacion,
        sintesis_ia: createDto.sintesis_ia,
        links_referencia: createDto.links_referencia,
        videos_url: createDto.videos_url,
        img_portada: imgPortadaBuffer,
        img_contenido: imgContenidoBuffer,
        pdf_url: pdfUrl,
        investigador_principal_id: createDto.investigador_principal_id,
        categoria_id: createDto.categoria_id,
      });

      return await this.publicacionRepo.save(publicacion);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la publicación',
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await this.publicacionRepo.createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.investigador_principal', 'investigador')
      .leftJoinAndSelect('publicacion.categoria', 'categoria')
      .select([
        'publicacion.id',
        'publicacion.titulo',
        'publicacion.sub_categoria',
        'publicacion.colaboradores',
        'publicacion.descripcion_investigacion',
        'publicacion.sintesis_ia',
        'publicacion.links_referencia',
        'publicacion.videos_url',
        'publicacion.pdf_url',
        'publicacion.descargas',
        'publicacion.vistas',
        'publicacion.created_at',
        'publicacion.categoria_id',
        'investigador.id',
        'investigador.nombre',
        'investigador.apellidos',
        // 'investigador.foto_perfil', // EXCLUDED
        'categoria.id',
        'categoria.nombre'
      ])
      .orderBy('publicacion.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit)
    };
  }

  async findByInvestigador(investigadorId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.publicacionRepo.createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.categoria', 'categoria') // Assuming we only need category here since we know investigator
      .select([
        'publicacion.id',
        'publicacion.titulo',
        'publicacion.sub_categoria',
        'publicacion.colaboradores',
        'publicacion.descripcion_investigacion',
        'publicacion.sintesis_ia',
        'publicacion.links_referencia',
        'publicacion.videos_url',
        'publicacion.pdf_url',
        'publicacion.descargas',
        'publicacion.vistas',
        'publicacion.created_at',
        'publicacion.categoria_id',
        'categoria.id',
        'categoria.nombre'
      ])
      .where('publicacion.investigador_principal_id = :investigadorId', { investigadorId })
      .orderBy('publicacion.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit)
    };
  }

  async findOne(id: number) {
    const publicacion = await this.publicacionRepo.findOne({
      where: { id },
      relations: ['investigador_principal', 'categoria'],
      select: {
        img_portada: false,
        img_contenido: false,
      },
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publicacion;
  }


  async findOneAndIncrementVistas(id: number) {
    const publicacion = await this.findOne(id);

    await this.publicacionRepo.increment({ id }, 'vistas', 1);

    return publicacion;
  }

  async incrementarVistas(id: number) {
    const result = await this.publicacionRepo.increment(
      { id },
      'vistas',
      1,
    );

    if (!result.affected) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return { message: 'Vista incrementada correctamente' };
  }

  async incrementarDescargas(id: number) {
    const result = await this.publicacionRepo.increment(
      { id },
      'descargas',
      1,
    );

    if (!result.affected) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return { message: 'Descarga incrementada correctamente' };
  }


  async findOneWithImage(id: number) {
    const publicacion = await this.publicacionRepo.findOne({
      where: { id },
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publicacion;
  }


  async update(id: number, updateDto: UpdatePublicacionDto) {
    const publicacion = await this.publicacionRepo.findOne({
      where: { id },
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    Object.assign(publicacion, updateDto);

    return this.publicacionRepo.save(publicacion);
  }

  async remove(id: number) {
    const publicacion = await this.publicacionRepo.findOne({
      where: { id },
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (publicacion.pdf_url) {
      if (publicacion.pdf_url.startsWith('googleDrive://')) {
        const fileId = publicacion.pdf_url.replace('googleDrive://', '');
        await this.googleDriveService.deleteFile(fileId);
      } else {
        const path = `.${publicacion.pdf_url}`;
        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      }
    }

    return this.publicacionRepo.remove(publicacion);
  }
}

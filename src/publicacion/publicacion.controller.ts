import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe } from '@nestjs/common';
import { PublicacionService } from './publicacion.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';

@Controller('publicacion')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) { }

  @Post()
  create(
    @Body() createPublicacionDto: CreatePublicacionDto,
    @Body('investigadorId', ParseIntPipe) investigadorId: number,
  ) {
    return this.publicacionService.createPublicacion(
      createPublicacionDto,
      investigadorId,
    );
  }

  @Get('all')
  findAll() {
    return this.publicacionService.findAll();
  }

  // OBTENER PUBLICACIONES POR CATEGORÍA
  @Get('categoria/:categoriaId')
  findByCategoria(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
  ) {
    return this.publicacionService.findByCategoria(categoriaId);
  }

  // OBTENER PUBLICACIONES DE UN INVESTIGADOR
  @Get('investigador/:investigadorId')
  findByInvestigador(
    @Param('investigadorId', ParseIntPipe) investigadorId: number,
  ) {
    return this.publicacionService.findByInvestigador(investigadorId);
  }

  // OBTENER UNA PUBLICACIÓN POR ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.publicacionService.findOne(id);
  }

  // OBTENER PUBLICACIÓN Y AUMENTAR VISTAS
  @Get(':id/vistas')
  findOneAndIncrementVistas(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.publicacionService.findOneAndIncrementVistas(id);
  }

  // ACTUALIZAR PUBLICACIÓN
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePublicacionDto: UpdatePublicacionDto,
    @Body('investigadorId', ParseIntPipe) investigadorId: number,
  ) {
    return this.publicacionService.updatePublicacion(
      id,
      updatePublicacionDto,
      investigadorId,
    );
  }

  // ELIMINAR PUBLICACIÓN
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Body('investigadorId', ParseIntPipe) investigadorId: number,
  ) {
    return this.publicacionService.removePublicacion(
      id,
      investigadorId,
    );
  }
}

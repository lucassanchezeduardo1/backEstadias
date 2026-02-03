import { Controller, Get, Post, Body, Patch, Param, Delete, Request, ParseIntPipe } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) { }

  @Post()
  // @UseGuards(JwtAuthGuard) // Guard de autenticación
  async create(
    @Body() createComentarioDto: CreateComentarioDto,
    @Request() req: any
  ) {
    const usuarioId = req.user?.id || 1; // Temporal
    return await this.comentariosService.create(createComentarioDto, usuarioId);
  }

  // OBTENER COMENTARIOS DE UNA PUBLICACIÓN (Investigador)
  @Get('publicacion/:id')
  // @UseGuards(JwtAuthGuard)
  async findByPublicacion(
    @Param('id', ParseIntPipe) publicacionId: number,
    @Request() req: any
  ) {
    const investigadorId = req.user?.id || 1; // Temporal
    return await this.comentariosService.findByPublicacion(publicacionId, investigadorId);
  }

  // OBTENER COMENTARIOS NO LEÍDOS (Investigador)
  @Get('no-leidos')
  // @UseGuards(JwtAuthGuard)
  async findNoLeidos(@Request() req: any) {
    const investigadorId = req.user?.id || 1; // Temporal
    return await this.comentariosService.findNoLeidos(investigadorId);
  }

  // MARCAR COMO LEÍDO (Investigador)
  @Patch(':id/marcar-leido')
  // @UseGuards(JwtAuthGuard)
  async marcarComoLeido(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const investigadorId = req.user?.id || 1; // Temporal
    return await this.comentariosService.marcarComoLeido(id, investigadorId);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const investigadorId = req.user?.id || 1; // Temporal
    return await this.comentariosService.remove(id, investigadorId);
  }
}

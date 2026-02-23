import { Controller, Get, Post, Body, Patch, Param, Delete, Request, ParseIntPipe, Query } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { UpdateFavoritoDto } from './dto/update-favorito.dto';

@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) { }

  @Post()
  // @UseGuards(JwtAuthGuard) // Guard de autenticación
  async create(
    @Body() createFavoritoDto: CreateFavoritoDto,
    @Request() req: any,
    @Query('usuarioId') queryUserId?: string
  ) {
    const usuarioId = req.user?.id || (queryUserId ? +queryUserId : 1);
    return await this.favoritosService.create(createFavoritoDto, usuarioId);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any, @Query('usuarioId') queryUserId?: string) {
    const usuarioId = req.user?.id || (queryUserId ? +queryUserId : 1);
    return await this.favoritosService.findAll(usuarioId);
  }

  // OBTENER ESTADÍSTICAS DE FAVORITOS
  @Get('estadisticas')
  // @UseGuards(JwtAuthGuard)
  async getEstadisticas(@Request() req: any, @Query('usuarioId') queryUserId?: string) {
    const usuarioId = req.user?.id || (queryUserId ? +queryUserId : 1);
    return await this.favoritosService.getEstadisticas(usuarioId);
  }

  // VERIFICAR SI UNA PUBLICACIÓN ES FAVORITA
  @Get('verificar/:publicacionId')
  // @UseGuards(JwtAuthGuard)
  async esFavorito(
    @Param('publicacionId', ParseIntPipe) publicacionId: number,
    @Request() req: any,
    @Query('usuarioId') queryUserId?: string
  ) {
    const usuarioId = req.user?.id || (queryUserId ? +queryUserId : 1);
    return await this.favoritosService.esFavorito(publicacionId, usuarioId);
  }

  // TOGGLE FAVORITO (agregar o quitar con un solo endpoint)
  @Post('toggle/:publicacionId')
  // @UseGuards(JwtAuthGuard)
  async toggle(
    @Param('publicacionId', ParseIntPipe) publicacionId: number,
    @Request() req: any,
    @Query('usuarioId') queryUserId?: string
  ) {
    const usuarioId = req.user?.id || (queryUserId ? +queryUserId : 1);
    return await this.favoritosService.toggle(publicacionId, usuarioId);
  }

  // OBTENER UN FAVORITO POR ID
  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Query('usuarioId') queryUserId?: string
  ) {
    const usuarioId = req.user?.id || (queryUserId ? +queryUserId : 1);
    return await this.favoritosService.findOne(id, usuarioId);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Query('usuarioId') queryUserId?: string
  ) {
    const usuarioId = req.user?.id || (queryUserId ? +queryUserId : 1);
    return await this.favoritosService.remove(id, usuarioId);
  }

  // ELIMINAR DE FAVORITOS (por ID de publicación)
  @Delete('publicacion/:publicacionId')
  // @UseGuards(JwtAuthGuard)
  async removeByPublicacion(
    @Param('publicacionId', ParseIntPipe) publicacionId: number,
    @Request() req: any,
    @Query('usuarioId') queryUserId?: string
  ) {
    const usuarioId = req.user?.id || (queryUserId ? +queryUserId : 1);
    return await this.favoritosService.removeByPublicacion(publicacionId, usuarioId);
  }
}

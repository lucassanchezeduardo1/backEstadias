import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, ParseIntPipe } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, InvestigadorGuard)
  async create(
    @Body() createEventoDto: CreateEventoDto,
    @Request() req: any 
  ) {
    const investigadorId = req.user?.id || 1; 
    return await this.eventosService.create(createEventoDto, investigadorId); 
  }

  @Get()
  async findAll() {
    return await this.eventosService.findAll();
  }

  @Get('proximos')
  async findProximos() {
    return await this.eventosService.findProximos();
  }

  @Get('pasados')
  async findPasados() {
    return await this.eventosService.findPasados();
  }


  @Get('estadisticas')
  async getEstadisticas() {
    return await this.eventosService.getEstadisticas();
  }


  @Get('buscar')
  async buscar(@Query('termino') termino: string) {
    if (!termino) {
      return { message: 'Debe proporcionar un término de búsqueda', eventos: [] };
    }
    return await this.eventosService.buscar(termino);
  }

  @Get('categoria/:categoriaId')
  async findByCategoria(@Param('categoriaId', ParseIntPipe) categoriaId: number) {
    return await this.eventosService.findByCategoria(categoriaId);
  }


  @Get('modalidad/:modalidad')
  async findByModalidad(@Param('modalidad') modalidad: 'presencial' | 'virtual' | 'hibrida') {
    return await this.eventosService.findByModalidad(modalidad);
  }

  @Get('investigador/:investigadorId')
  async findByInvestigador(@Param('investigadorId', ParseIntPipe) investigadorId: number) {
    return await this.eventosService.findByInvestigador(investigadorId);
  }

  @Get('mis-eventos')
  // @UseGuards(JwtAuthGuard, InvestigadorGuard)
  async findMisEventos(@Request() req: any) {
    const investigadorId = req.user?.id || 1;
    return await this.eventosService.findByInvestigador(investigadorId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.eventosService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, InvestigadorGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventoDto: UpdateEventoDto,
    @Request() req: any
  ) {
    const investigadorId = req.user?.id || 1; 
    return await this.eventosService.update(id, updateEventoDto, investigadorId); 
  }


  @Delete(':id')
  // @UseGuards(JwtAuthGuard, InvestigadorGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any // ⬅️ AGREGADO
  ) {
    const investigadorId = req.user?.id || 1;
    return await this.eventosService.remove(id, investigadorId); 
  }
}

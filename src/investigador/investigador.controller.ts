import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvestigadorService } from './investigador.service';
import { CreateInvestigadorDto } from './dto/create-investigador.dto';
import { UpdateInvestigadorDto } from './dto/update-investigador.dto';

@Controller('investigador')
export class InvestigadorController {
  constructor(private readonly investigadorService: InvestigadorService) {}

  @Post()
  create(@Body() createInvestigadorDto: CreateInvestigadorDto) {
    return this.investigadorService.create(createInvestigadorDto);
  }

  @Get()
  findAll() {
    return this.investigadorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investigadorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvestigadorDto: UpdateInvestigadorDto) {
    return this.investigadorService.update(+id, updateInvestigadorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.investigadorService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstitucionesService } from './instituciones.service';
import { CreateInstitucioneDto } from './dto/create-institucione.dto';
import { UpdateInstitucioneDto } from './dto/update-institucione.dto';

@Controller('instituciones')
export class InstitucionesController {
  constructor(private readonly institucionesService: InstitucionesService) {}

  @Post()
  create(@Body() createInstitucioneDto: CreateInstitucioneDto) {
    return this.institucionesService.create(createInstitucioneDto);
  }

  @Get()
  findAll() {
    return this.institucionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.institucionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstitucioneDto: UpdateInstitucioneDto) {
    return this.institucionesService.update(+id, updateInstitucioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.institucionesService.remove(+id);
  }
}

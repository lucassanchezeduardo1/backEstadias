import { Module } from '@nestjs/common';
import { InstitucionesService } from './instituciones.service';
import { InstitucionesController } from './instituciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institucione } from './entities/institucione.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Institucione])],
  controllers: [InstitucionesController],
  providers: [InstitucionesService],
})
export class InstitucionesModule {}

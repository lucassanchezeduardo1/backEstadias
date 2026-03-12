import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';

import { GoogleDriveModule } from '../google-drive/google-drive.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Evento, Categoria]),
    GoogleDriveModule,
  ],
  controllers: [EventosController],
  providers: [EventosService],
})
export class EventosModule {}

import { Module } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comentario } from './entities/comentario.entity';
import { PublicacionModule } from 'src/publicacion/publicacion.module';

@Module({
  imports:[TypeOrmModule.forFeature([Comentario]), PublicacionModule],
  controllers: [ComentariosController],
  providers: [ComentariosService],
  exports: [ComentariosService] 
})
export class ComentariosModule {}

import { Module } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { FavoritosController } from './favoritos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorito } from './entities/favorito.entity';
import { Publicacion } from 'src/publicacion/entities/publicacion.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorito, Publicacion]),
    UsuariosModule
  ],
  controllers: [FavoritosController],
  providers: [FavoritosService],
  exports: [TypeOrmModule]
})
export class FavoritosModule { }

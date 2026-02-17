import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministradorModule } from './administrador/administrador.module';
import { InvestigadorModule } from './investigador/investigador.module';
import { InstitucionesModule } from './instituciones/instituciones.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PublicacionModule } from './publicacion/publicacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { EventosModule } from './eventos/eventos.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // CARGA VARIABLES DE ENTORNO (.env)
    ConfigModule.forRoot({
      isGlobal: true, // disponible en todo el proyecto
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'estadias_bd',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AdministradorModule,
    InvestigadorModule,
    InstitucionesModule,
    CategoriasModule,
    PublicacionModule,
    UsuariosModule,
    ComentariosModule,
    EventosModule,
    FavoritosModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

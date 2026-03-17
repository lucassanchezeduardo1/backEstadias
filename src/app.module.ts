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
import { GoogleDriveModule } from './google-drive/google-drive.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, }),

    TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST || 'mysql.railway.internal',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  autoLoadEntities: true,
  synchronize: true,
  connectorPackage: 'mysql2',
  // 👇 CONFIGURACIÓN PARA RAILWAY:
  connectTimeout: 60000,
  acquireTimeout: 60000,
  extra: {
    ssl: false,  // 👈 DESHABILITA SSL temporalmente
    connectionLimit: 10,
    connectTimeout: 60000
  }
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
    GoogleDriveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

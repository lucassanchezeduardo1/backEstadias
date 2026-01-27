import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministradorModule } from './administrador/administrador.module';
import { InvestigadorModule } from './investigador/investigador.module';
import { InstitucionesModule } from './instituciones/instituciones.module';
import { CategoriasModule } from './categorias/categorias.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'estadias_bd',
      autoLoadEntities:true,
      synchronize: true, 
    }),
    AdministradorModule,
    InvestigadorModule,
    InstitucionesModule,
    CategoriasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

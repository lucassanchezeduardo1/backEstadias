import { Module } from '@nestjs/common';
import { AdministradorService } from './administrador.service';
import { AdministradorController } from './administrador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from './entities/administrador.entity';
import { AdminSeedService } from './admin.seed';

@Module({
  imports:[TypeOrmModule.forFeature([Administrador])],
  controllers: [AdministradorController],
  providers: [AdministradorService, AdminSeedService],
})
export class AdministradorModule {}

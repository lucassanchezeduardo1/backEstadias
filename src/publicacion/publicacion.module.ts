import { Module } from '@nestjs/common';
import { PublicacionService } from './publicacion.service';
import { PublicacionController } from './publicacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicacion } from './entities/publicacion.entity';
import { GoogleDriveModule } from '../google-drive/google-drive.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publicacion]),
    GoogleDriveModule,
  ],
  controllers: [PublicacionController],
  providers: [PublicacionService],
  exports: [
    TypeOrmModule,
    PublicacionService
  ],
})
export class PublicacionModule { }

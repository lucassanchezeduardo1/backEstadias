import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from './entities/administrador.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeedService implements OnModuleInit {

  constructor(
    @InjectRepository(Administrador)
    private administradorRepo: Repository<Administrador>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createAdmin();
  }

  private async createAdmin() {

    const nombre = this.configService.get<string>('ADMIN_NOMBRE');
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!nombre || !email || !password) {
      console.log('Variables de entorno del admin no configuradas.');
      return;
    }

    const adminExists = await this.administradorRepo.findOne({
      where: { email },
    });

    if (adminExists) {
      console.log('Admin ya existe.');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = this.administradorRepo.create({
      nombre,
      email,
      password: passwordHash,
    });

    await this.administradorRepo.save(admin);

    console.log('Admin creado automáticamente en servidor.');
  }
}

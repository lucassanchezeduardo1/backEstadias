import { Injectable } from '@nestjs/common';
import { CreateInstitucioneDto } from './dto/create-institucione.dto';
import { UpdateInstitucioneDto } from './dto/update-institucione.dto';

@Injectable()
export class InstitucionesService {
  create(createInstitucioneDto: CreateInstitucioneDto) {
    return 'This action adds a new institucione';
  }

  findAll() {
    return `This action returns all instituciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} institucione`;
  }

  update(id: number, updateInstitucioneDto: UpdateInstitucioneDto) {
    return `This action updates a #${id} institucione`;
  }

  remove(id: number) {
    return `This action removes a #${id} institucione`;
  }
}

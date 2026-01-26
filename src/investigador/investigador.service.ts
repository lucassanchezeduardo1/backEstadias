import { Injectable } from '@nestjs/common';
import { CreateInvestigadorDto } from './dto/create-investigador.dto';
import { UpdateInvestigadorDto } from './dto/update-investigador.dto';

@Injectable()
export class InvestigadorService {
  create(createInvestigadorDto: CreateInvestigadorDto) {
    return 'This action adds a new investigador';
  }

  findAll() {
    return `This action returns all investigador`;
  }

  findOne(id: number) {
    return `This action returns a #${id} investigador`;
  }

  update(id: number, updateInvestigadorDto: UpdateInvestigadorDto) {
    return `This action updates a #${id} investigador`;
  }

  remove(id: number) {
    return `This action removes a #${id} investigador`;
  }
}

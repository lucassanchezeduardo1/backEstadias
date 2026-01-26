import { Module } from '@nestjs/common';
import { InvestigadorService } from './investigador.service';
import { InvestigadorController } from './investigador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investigador } from './entities/investigador.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Investigador])],
  controllers: [InvestigadorController],
  providers: [InvestigadorService],
})
export class InvestigadorModule {}

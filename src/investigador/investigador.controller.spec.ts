import { Test, TestingModule } from '@nestjs/testing';
import { InvestigadorController } from './investigador.controller';
import { InvestigadorService } from './investigador.service';

describe('InvestigadorController', () => {
  let controller: InvestigadorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestigadorController],
      providers: [InvestigadorService],
    }).compile();

    controller = module.get<InvestigadorController>(InvestigadorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

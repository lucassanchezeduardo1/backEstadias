import { Test, TestingModule } from '@nestjs/testing';
import { InvestigadorService } from './investigador.service';

describe('InvestigadorService', () => {
  let service: InvestigadorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestigadorService],
    }).compile();

    service = module.get<InvestigadorService>(InvestigadorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

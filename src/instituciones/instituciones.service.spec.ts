import { Test, TestingModule } from '@nestjs/testing';
import { InstitucionesService } from './instituciones.service';

describe('InstitucionesService', () => {
  let service: InstitucionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstitucionesService],
    }).compile();

    service = module.get<InstitucionesService>(InstitucionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

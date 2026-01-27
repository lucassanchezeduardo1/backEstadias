import { Test, TestingModule } from '@nestjs/testing';
import { InstitucionesController } from './instituciones.controller';
import { InstitucionesService } from './instituciones.service';

describe('InstitucionesController', () => {
  let controller: InstitucionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitucionesController],
      providers: [InstitucionesService],
    }).compile();

    controller = module.get<InstitucionesController>(InstitucionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

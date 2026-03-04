import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('sintesis')
    async generarSintesis(@Body('texto') texto: string) {
        const sintesis = await this.aiService.generarSintesis(texto);
        return { sintesis };
    }

    @Post('examen')
    async generarExamen(@Body('contenido') contenido: string, @Body('titulo') titulo: string) {
        const preguntas = await this.aiService.generarExamen(contenido, titulo);
        return { preguntas };
    }
}

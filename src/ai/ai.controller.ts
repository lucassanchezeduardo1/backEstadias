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
}

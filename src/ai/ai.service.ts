import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
    private readonly groqApiKey: string | undefined;
    private readonly groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.groqApiKey = this.configService.get<string>('GROQ_API_KEY');
    }

    async generarSintesis(texto: string): Promise<string> {
        if (!this.groqApiKey) {
            throw new InternalServerErrorException('GROQ_API_KEY no configurada en el servidor');
        }

        const prompt = `Actúa como un divulgador científico experto de alto nivel.
        Resume la siguiente investigación científica de manera clara, profesional, coherente y atractiva para un público interesado en la ciencia. 
        La síntesis debe ser de aproximadamente 300 a 400 palabras, resaltar los hallazgos más importantes, la metodología y las conclusiones principales.
        Usa un lenguaje formal pero accesible.
        
        Investigación: \n\n ${texto}`;

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    this.groqUrl,
                    {
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            {
                                role: 'user',
                                content: prompt,
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 1024,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.groqApiKey}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            ) as any;

            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error('Error llamando a Groq:', error.response?.data || error.message);
            throw new InternalServerErrorException('Error al procesar la síntesis con Groq');
        }
    }
}

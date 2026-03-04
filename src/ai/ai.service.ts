import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
    private readonly groqApiKey: string | undefined;
    private readonly groqApiKeyExamen: string | undefined;
    private readonly groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.groqApiKey = this.configService.get<string>('GROQ_API_KEY');
        this.groqApiKeyExamen = this.configService.get<string>('GROQ_API_KEY_EXAMEN');
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

    async generarExamen(contenido: string, titulo: string): Promise<any[]> {
        if (!this.groqApiKeyExamen) {
            throw new InternalServerErrorException('GROQ_API_KEY_EXAMEN no configurada en el servidor');
        }

        const prompt = `
            Actúa como un profesor experto. Genera un examen de opción múltiple de exactamente 7 a 10 preguntas basado exclusivamente en el siguiente contenido sobre "${titulo}":
            
            CONTENIDO:
            ${contenido}
            
            REGLAS:
            1. Devuelve ÚNICAMENTE un objeto JSON válido.
            2. El formato debe ser: {"preguntas": [{"pregunta": "...", "opciones": ["A", "B", "C"], "respuestaCorrecta": 0}, ...]}
            3. "respuestaCorrecta" debe ser el índice (0-3) de la opción correcta en el arreglo "opciones".
            4. Las preguntas deben ser desafiantes pero justas.
            5. Todo el contenido debe estar en ESPAÑOL.
        `;

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    this.groqUrl,
                    {
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            {
                                role: 'system',
                                content: 'Eres un asistente educativo que genera exámenes en formato JSON.',
                            },
                            {
                                role: 'user',
                                content: prompt,
                            },
                        ],
                        temperature: 0.7,
                        response_format: { type: 'json_object' },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.groqApiKeyExamen}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            ) as any;

            const content = JSON.parse(response.data.choices[0].message.content);
            return content.preguntas || [];
        } catch (error: any) {
            console.error('Error llamando a Groq para examen:', error.response?.data || error.message);
            throw new InternalServerErrorException('Error al generar el examen con Groq');
        }
    }
}


import { IAModelI, ModelResponse } from '@/types';
import { variables } from '@variables/variables'

import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: variables.DEEPSEEK_API_KEY,
});

const systemPrompt = `Eres un evaluador de código de Arduino. Tu tarea es analizar el código proporcionado y responder en formato JSON. La respuesta debe incluir una calificación entre 0 y 1, donde 0 es muy malo y 1 es excelente. También debes proporcionar un comentario que explique la calificación. El comentario debe ser corto, claro y conciso y no debe contener información innecesaria. Si tienes multiples comentarios, debes elegir el más relevante. No debes incluir ningún otro tipo de información en la respuesta. Tampoco debes corregir el código, solo evaluarlo. La respuesta debe seguir el siguiente formato:

EJEMPLO DE RESPUESTA:
{
    "calificacion": 0.5,
    "comentario": "El código es bueno, pero tiene algunos errores menores.",
}
`;

export class DeepSeekModel implements IAModelI {


     async generateResponse(prompt: string): Promise<ModelResponse> {
        try {
            const response = await openai.chat.completions.create({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                response_format: {
                    'type': 'json_object'
                },
                max_tokens: 50,
                temperature: 0.0,
            });

            if (response.choices && response.choices.length > 0) {
                const resp = response.choices[0].message.content ?? ''
                return resp ? JSON.parse(resp) : 
                { calificacion: 0, comentario: 'No se pudo generar una respuesta válida.' };
            } else {
                throw new Error('No response from DeepSeek');
            }
        } catch (error) {
            console.error('Error generating response from DeepSeek:', error);
            throw error;
        }
    }

}
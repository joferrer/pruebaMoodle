import { variables } from "@/envs/variables";
import { IAModelI, ModelResponse } from "@/types";
import { GoogleGenAI, } from "@google/genai";
import { systemPrompt } from "../prompt/prompt";

const ai = new GoogleGenAI({
    apiKey: variables.GEMINI_API_KEY
});


export class GeminiModel implements IAModelI {
    async generateResponse(prompt: string, questionPrompt: string): Promise<ModelResponse> {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: `${systemPrompt}\n\n${questionPrompt}`,
                    thinkingConfig: {
                        thinkingBudget: 0, // Disables thinking
                    },
                    maxOutputTokens: 50,
                    temperature: 0.0,

                }
            });

            const responseText = response?.text || '';
            const jsonStr = this.validarRespuesta(responseText);
            console.log('Gemini response:', jsonStr);

            return jsonStr ? JSON.parse(jsonStr) : {
                calificacion: 0,
                comentario: 'No se pudo generar una respuesta válida.'
            };
        } catch (error) {
            console.error('Error generating response from Gemini:', error);
            throw error;
        }
    }
    validarRespuesta(response: string): string | null {
        const regex = /CALIFICACION=([0-1](\.\d+)?); COMENTARIO=(.+)/;
        const match = response.match(regex);
        if (match) {
            const calificacion = parseFloat(match[1]);
            const comentario = match[3].trim();
            return JSON.stringify({ calificacion, comentario });
        }

        return null;
    }
}

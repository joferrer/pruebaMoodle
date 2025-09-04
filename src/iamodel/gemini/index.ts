import { variables } from "@/envs/variables";
import { IAModelI, ModelResponse } from "@/types";
import { GoogleGenAI, } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: variables.GEMINI_API_KEY
});

const systemPrompt = `/* Eres un evaluador de código de Arduino. Tu tarea es analizar el código proporcionado y responder en formato JSON. La respuesta debe incluir una calificación entre 0 y 1, donde 0 es muy malo y 1 es excelente. También debes proporcionar un comentario que explique la calificación. El comentario debe ser corto, claro y conciso y no debe contener información innecesaria. Si tienes multiples comentarios, debes elegir el más relevante. No debes incluir ningún otro tipo de información en la respuesta. Tampoco debes corregir el código, solo evaluarlo. La respuesta debe seguir el siguiente formato, No incluyas delimitadores de bloque de código, responde solo con JSON válido. Es absolutamente importante que no omitas las llaves de apertura y cierre del JSON:

EJEMPLO DE RESPUESTA:
{
    "calificacion": 0.5,
    "comentario": "El código es bueno, pero tiene algunos errores menores."
} */
`;

export class GeminiModel implements IAModelI {
    async generateResponse(prompt: string,questionPrompt:string): Promise<ModelResponse> {
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

            // Quitar delimitadores de bloque de código tipo ```json ... ```
            const jsonStr = response.text?.replace(/```json|```/g, '').trim();
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
}

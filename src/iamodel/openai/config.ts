import OpenAI from 'openai';
import { variables } from '@variables/variables';
import { IAModelI, ModelResponse } from '@/types';

const client = new OpenAI({
    apiKey: variables.OPENAI_API_KEY, 
});


export class OpenAIModel implements IAModelI {

    //TODO: Usar la prompt del parametro.
     async generateResponse(_prompt: string): Promise<ModelResponse> {
        const response = await client.responses.create({
            model: 'gpt-4o',
            instructions: 'You are a coding assistant that talks like a pirate',
            input: 'Are semicolons optional in JavaScript?',
        });
        const resp =  response.output_text ?? ''
        return resp ? JSON.parse(resp) : 
                { calificacion: 0, comentario: 'No se pudo generar una respuesta válida.' };
    }
}

export default OpenAIModel;
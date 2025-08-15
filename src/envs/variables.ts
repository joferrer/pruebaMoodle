
import { EnvVariables } from '@/types';
import { config } from 'dotenv';

config();

class EnvManager {
    private variables: EnvVariables;

    constructor(){
        //TODO: Pueden haber más modelos, no debería ser obligatoria la apiKey de ningún modelo, pero si debe haber uno al menos.
        this.variables = {
            PORT: process.env.PORT || '3000' ,
            CONSUMER_KEY: this.requireEnv('CONSUMER_KEY'),
            CONSUMER_SECRET: this.requireEnv('CONSUMER_SECRET'),
            JWT_SECRET: this.requireEnv('JWT_SECRET'),
            DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
            OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
            GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

        };
    }
    requireEnv(name: string): string {
        const value = process.env[name];
        if (!value) {
            throw new Error(`Falta la variable de entorno: ${name}`);
        }
        return value;
    }
    getVariables(): EnvVariables {
        return this.variables;
    }
}

export const variables = new EnvManager().getVariables();

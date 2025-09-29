
import { EnvVariables } from '@/types';
import { config } from 'dotenv';
import { errors } from '@/types';

config();

interface Models_avaliables{
    OPENAI: boolean,
    DEEPSEEK: boolean,
    GEMINI: boolean
}

class EnvManager {
    private variables: EnvVariables;
    public models: Models_avaliables = {
        OPENAI: process.env.OPENAI_API_KEY ? true : false,
        DEEPSEEK: process.env.DEEPSEEK_API_KEY ? true : false,
        GEMINI: process.env.GEMINI_API_KEY ? true : false
    }

    constructor(){
        
        this.variables = {
            PORT: process.env.PORT || '3000' ,
            CONSUMER_KEY: this.requireEnv('CONSUMER_KEY'),
            CONSUMER_SECRET: this.requireEnv('CONSUMER_SECRET'),
            JWT_SECRET: this.requireEnv('JWT_SECRET'),
            DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
            OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
            GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
            CHISPA_SIMULATOR_URL: this.requireEnv('CHISPA_SIMULATOR_URL'),
            CODE_EVALUATOR_URL: this.requireEnv('CODE_EVALUATOR_URL')
        };
        if (!this.verifyModels()) {
            throw new Error(errors.NO_AI_MODELS_CONFIGURED);
        }
    }
    requireEnv(name: string): string {
        const value = process.env[name];
        if (!value) {
            throw new Error(`${errors.MISSING_ENV_VARIABLE} ${name}`);
        }
        return value;
    }

    verifyModels(): boolean {
        return Object.values(this.models).some(model => model);
    }

    getVariables(): EnvVariables {
        return this.variables;
    }

    getModelsAvaliables(): Models_avaliables {
        return this.models;
    }
}

export const variables = new EnvManager().getVariables();

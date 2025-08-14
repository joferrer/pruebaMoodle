
import { config } from 'dotenv';

config();

class EnvManager {
    private variables: { [key: string]: string };

    constructor(){
        this.variables = {
            CONSUMER_KEY: this.requireEnv('CONSUMER_KEY'),
            CONSUMER_SECRET: this.requireEnv('CONSUMER_SECRET'),
            JWT_SECRET: this.requireEnv('JWT_SECRET'),
            PORT: process.env.PORT || '3000' ,
           
        };
    }
    requireEnv(name: string): string {
        const value = process.env[name];
        if (!value) {
            throw new Error(`Falta la variable de entorno: ${name}`);
        }
        return value;
    }
    getVariables(): { [key: string]: string } {
        return this.variables;
    }
}

export const variablesM = new EnvManager().getVariables();

export const variables = {
    CONSUMER_KEY: process.env.CONSUMER_KEY,
    CONSUMER_SECRET: process.env.CONSUMER_SECRET,
    JWT_SECRET: process.env.JWT_SECRET
}


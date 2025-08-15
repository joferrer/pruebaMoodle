

interface Errors {
    MISSING_ENV_VARIABLE: string;
    NO_AI_MODELS_CONFIGURED: string;
}

export const errors: Errors = {
    MISSING_ENV_VARIABLE: 'Falta la variable de entorno: ',
    NO_AI_MODELS_CONFIGURED: 'Debe haber al menos un modelo de IA configurado'
};
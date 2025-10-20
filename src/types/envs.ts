

export interface EnvVariables {
    CONSUMER_KEY: string;
    CONSUMER_SECRET: string;
    JWT_SECRET: string;
    PORT: string;
    GEMINI_API_KEY?: string;
    DEEPSEEK_API_KEY?: string;
    OPENAI_API_KEY?: string; // TODO: Como el modelo puede ser otro, se puede cambiar el nombre de la variable.
    CHISPA_SIMULATOR_URL: string;
    CODE_EVALUATOR_URL: string;
    CODE_EVALUATOR_BASIC_URL: string;
    CHISPA_SIMULATOR_BASIC_URL: string;
}
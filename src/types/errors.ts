

interface Errors {
    MISSING_ENV_VARIABLE: string;
    NO_AI_MODELS_CONFIGURED: string;
    MOODLE_CALIFICATION_ERROR: string;
    MOODLE_LTI_MISSING_DATA: string;
}

export const errors: Errors = {
    MISSING_ENV_VARIABLE: 'Falta la variable de entorno: ',
    NO_AI_MODELS_CONFIGURED: 'Debe haber al menos un modelo de IA configurado',
    MOODLE_CALIFICATION_ERROR: 'Error al calificar en Moodle',
    MOODLE_LTI_MISSING_DATA: 'Faltan campos obligatorios en LTI data'
};
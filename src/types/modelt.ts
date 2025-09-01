

export interface ModelResponse {
    calificacion: number;
    comentario: string;
}

export interface IAModelI {
    generateResponse(prompt: string, questionPrompt:string): Promise<ModelResponse>;
}



interface Prompt {
    id: string;
    prompt: string;
}

const prompts: Prompt[] = [
    {
        id: "led-basic-code",
        prompt: "Al calificarse este código, considere que el pin del led debe ser el 13 y el codigo debe encender y apagar el led una vez por segundo" 
    }
]

export const getPromptById = (id: string): Prompt | undefined => {
    return prompts.find(p => p.id === id);
}


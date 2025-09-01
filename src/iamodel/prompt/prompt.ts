

interface Prompt {
    id: string;
    prompt: string;
}

const prompts: Prompt[] = [
    {
        id: "1",
        prompt: ""
    }
]

export const getPromptById = (id: string): Prompt | undefined => {
    return prompts.find(p => p.id === id);
}


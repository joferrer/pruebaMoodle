import { ModelResponse } from "@/types";
import { IAModelI } from "@/types";

abstract class IAModel {
    protected model: IAModelI;

    constructor(model: IAModelI) {
        this.model = model;
    }

    setModel(model: IAModelI): void {
        this.model = model;
    }

    abstract generateResponse(prompt: string): Promise<ModelResponse> ;
}

export class CodeReviewModel extends IAModel {
    override async generateResponse(prompt: string): Promise<ModelResponse> {
        return this.model.generateResponse(prompt);
    }
}
// @ts-ignore
import lti from 'ims-lti'


export class MoodleConexion {
    private provider: any;

    constructor() {
        this.provider = new lti.Provider(
            process.env.CONSUMER_KEY!,
            process.env.CONSUMER_SECRET!
        );
    }

    async validarRequest(req: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.provider.valid_request(req, (err: any, isValid: boolean) => {
                if (err || !isValid) {
                    return reject(new Error("Invalid launch request!"));
                }
                resolve();
            });
        });
    }

    getOutcomeService(): any {
        return this.provider.outcome_service;
    }

    async enviarNota(nota: number): Promise<void> {
        const outcomeService = this.getOutcomeService();

        if (!outcomeService) {
            throw new Error("No outcome service available.");
        }

        return new Promise((resolve, reject) => {
            outcomeService.send_replace_result(nota, (err: any, _result: any) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}
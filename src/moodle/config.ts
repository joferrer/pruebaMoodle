// @ts-ignore
import lti from 'ims-lti'
import {variables} from '@variables/variables'

interface LTIRequest extends Express.Request {
    body: any;
}


export class MoodleConexion {
    private provider: any;

    constructor() {
        this.provider = new lti.Provider(
            variables.CONSUMER_KEY!,
            variables.CONSUMER_SECRET!
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

     // Método para extraer datos importantes de la request LTI
    extraerDatosLTI(req: LTIRequest) {
        return {
            user_id: req.body.user_id,
            context_id: req.body.context_id,
            resource_link_id: req.body.resource_link_id,
            lis_outcome_service_url: req.body.lis_outcome_service_url,
            lis_result_sourcedid: req.body.lis_result_sourcedid,
            context_title: req.body.context_title,
            user_email: req.body.lis_person_contact_email_primary,
            user_name: req.body.lis_person_name_full,
            custom_params: this.extraerCustomParams(req.body)
        };
    }

     private extraerCustomParams(body: any) {
        const customParams: Record<string, any> = {};
        Object.keys(body).forEach(key => {
            if (key.startsWith('custom_')) {
                customParams[key] = body[key];
            }
        });
        return customParams;
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
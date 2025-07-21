// @ts-ignore
import lti from 'ims-lti'
import {variables} from '@variables/variables'

interface LTIRequest extends Express.Request {
    body: any;
}
interface LTIData {
    user_id: string;
    context_id: string;
    resource_link_id: string;
    lis_outcome_service_url?: string;
    lis_result_sourcedid?: string;
    context_title?: string;
    user_email?: string;
    user_name?: string;
    custom_params?: Record<string, any>;
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

   async enviarNota(nota: number, ltiData: LTIData): Promise<void> {
        const outcomeService = new lti.OutcomeService({
            service_url: ltiData.lis_outcome_service_url,
            source_did: ltiData.lis_result_sourcedid,
            consumer_key: variables.CONSUMER_KEY!,
            consumer_secret: variables.CONSUMER_SECRET!
        });

        return new Promise((resolve, reject) => {
            outcomeService.send_replace_result(nota, (err: any, result: any) => {
                if (err) {
                    console.error('Error enviando nota:', err);
                    return reject(new Error('Error al enviar nota a Moodle'));
                }
                console.log('Nota enviada exitosamente:', result);
                resolve();
            });
        });
    }

     validarIntegridadDatos(ltiData: LTIData): boolean {
        // Verificar campos obligatorios
        if (!ltiData.user_id || !ltiData.context_id || !ltiData.resource_link_id) {
            console.error('Faltan campos obligatorios en LTI data');
            return false;
        }

        // Verificar que podemos enviar calificaciones si es necesario
        if (!ltiData.lis_outcome_service_url || !ltiData.lis_result_sourcedid) {
            console.warn('Los datos LTI no soportan envío de calificaciones');
        }

        console.log('Datos LTI válidos para usuario:', ltiData.user_id);
        return true;
    }
}
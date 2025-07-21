import { variables } from '@/envs/variables';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = variables.JWT_SECRET ?? "";


export function crearTokenLTI(ltiData: LTIData): string {
    
    return jwt.sign(ltiData, JWT_SECRET, { expiresIn: '24h' });
}

export function validarTokenLTI(token: string): LTIData | null {
    try {
        return jwt.verify(token, JWT_SECRET) as LTIData;
    } catch (error) {
        console.error('Token JWT inválido:', error);
        return null;
    }
}

import { variables } from '@/envs/variables';
import jwt from 'jsonwebtoken';
import { ILTIData  } from '@/types/lti'; 

const JWT_SECRET = variables.JWT_SECRET ?? "";


export function crearTokenLTI(ltiData: ILTIData): string {
    return jwt.sign(ltiData, JWT_SECRET, { expiresIn: '1h' });
}

export function validarTokenLTI(token: string): ILTIData | null {
    try {
        return jwt.verify(token, JWT_SECRET) as ILTIData;
    } catch (error) {
        console.error('Token JWT inválido:', error);
        return null;
    }
}

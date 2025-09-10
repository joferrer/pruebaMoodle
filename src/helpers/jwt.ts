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

/**
 * Determina la duración restante de un token LTI en segundos.
 * @param token 
 * @returns segundos restantes o null si no se puede determinar.
 */
export function duracionRestanteTokenLTI(token: string): number  {
    try {

        let tiempoRestante = 0;
        const decoded = jwt.decode(token) as { exp: number } | null;
        if (decoded && decoded.exp) {
            const now = Math.floor(Date.now() / 1000);
            tiempoRestante = Math.max(decoded.exp - now) ;
        }
        return tiempoRestante;

    } catch (error) {
        console.error('Error al decodificar el token JWT:', error);
        return -1;
    }
}
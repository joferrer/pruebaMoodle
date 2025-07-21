import { Router, Request ,Response } from "express";
import { MoodleConexion } from "@moodle/config"
import { crearTokenLTI, validarTokenLTI } from "@/helpers/jwt";


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

export const router = Router()

// Middleware para validar token LTI
function requireLTI(req: Request, res: Response, next: any) {
    const token = req.cookies.lti_token;
    
    if (!token) {
        return res.status(401).json({ 
            error: "No hay token LTI válido" 
        });
    }
    
    const ltiData = validarTokenLTI(token);
    
    if (!ltiData) {
        return res.status(401).json({ 
            error: "Token LTI inválido o expirado" 
        });
    }
    
    // Agregar datos LTI al request para usarlos en la ruta
    (req as any).ltiData = ltiData;
    next();
    return;
}


router.post("/launch", async (req: Request, res) => {

    const moodle = new MoodleConexion();
    try {
        await moodle.validarRequest(req);

        const ltiData = moodle.extraerDatosLTI(req);

        const token = crearTokenLTI(ltiData);

        res.cookie('lti_token', token, {
            httpOnly: true,              // No accesible desde JavaScript del browser
            sameSite: 'strict',          // Protección CSRF
            maxAge: 24 * 60 * 60 * 1000  // 24 horas
        });

        res.redirect("/");
    } catch (err) {
        res.status(401).send("❌ LTI Launch inválido");
    }

})

router.post('/prueba', async (req, res) => {
    const token = req.cookies.lti_token

    if (!token) {
        return res.status(401).json({
            error: "No hay token LTI"
        });
    }

    return res.json({
        message: "¡Funciona!",
        usuario: token.user_name
    });

})

router.post('/evaluar', requireLTI ,async (req: Request, res) => {

    try {

         const ltiData = (req as any).ltiData as LTIData;

        const { suma } = req.body
        console.log(`${suma}`)
        const nota = suma == 2 ? 100 : 0

         // Validar integridad de los datos LTI guardados
        const moodle = new MoodleConexion();
        if (!moodle.validarIntegridadDatos(ltiData)) {
            return res.status(400).json({ 
                error: "Datos LTI incompletos o inválidos" 
            });
        }

        await moodle.enviarNota(nota,ltiData);
        console.log(`Nota ${nota} enviada para usuario ${ltiData.user_id}`);
        
        return res.json({ 
            success: true, 
            message: "Calificación enviada exitosamente",
            usuario: ltiData.user_name,
            nota: nota
        });

    } catch (err) {
        console.error('Error calificando:', err);
        return res.status(500).json({ 
            error: "Error interno al procesar calificación" 
        });
    }
})

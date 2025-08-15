import { Router, Request, Response } from "express";
import { MoodleConexion } from "@moodle/config"
import { crearTokenLTI, validarTokenLTI } from "@/helpers/jwt";
import { ILTIData as LTIData } from "@/types";
import { GeminiModel , CodeReviewModel} from "@/iamodel";


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

//TODO: Adaptar para que reciba que prueba se lanza.
//TODO: Hacer que el endpoint reciba que prueba se lanza.
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

        res.redirect("/"); //TODO: Redirigir en base a que prueba se quiere lanzar.
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

router.post('/evaluar', requireLTI, async (req: Request, res) => {

    try {

        const ltiData = (req as any).ltiData as LTIData;

        const { suma } = req.body
        console.log(`${suma}`)
        const nota = suma == 2 ? 1 : 0

        // Validar integridad de los datos LTI guardados
        const moodle = new MoodleConexion();
        if (!moodle.validarIntegridadDatos(ltiData)) {
            return res.status(400).json({
                error: "Datos LTI incompletos o inválidos"
            });
        }

        await moodle.enviarNota(nota, ltiData);
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
            error: "Error interno al procesar calificación",
            err
        });
    }
})

//TODO: Hacer el endpoint que resiba el código y lo evalúe con el modelo de IA
//TODO: Definir si se se puede cambiar el modelo de IA a usar.
router.get('/pruebaModelo', async (_req, res) => {

    
    const prompt = `
    #include <iostream>
    using namespace std;
    int main() {
        cout << 'Hello, World!' << endl; 
        return 0;
}
           `
    const modelo = new CodeReviewModel(new GeminiModel())
    try {
        const response = await modelo.generateResponse(prompt);
        return res.json(response);
    } catch (error) {
        console.error('Error al generar respuesta del modelo:', error);
        return res.status(500).json({
            error: "Error al generar respuesta del modelo",
            details: error
        });
    }
})
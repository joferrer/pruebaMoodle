import { Router, Request, Response } from "express";
import { MoodleConexion } from "@moodle/config"
import { crearTokenLTI, duracionRestanteTokenLTI, validarTokenLTI } from "@/helpers/jwt";
import { ILTIData as LTIData } from "@/types";
import { GeminiModel, CodeReviewModel, getPromptById } from "@/iamodel";
import { variables } from "@variables/variables";

export const router = Router()

// Middleware para validar token LTI por cookie
//TODO: Borrar este middleware y usar solo el de body.
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

// Middleware para validar token LTI en el body
function requireLTIBody(req: Request, res: Response, next: any) {
    // Buscar el token en el body
    const token = req.body?.token;

    if (!token) {
        return res.status(401).json({
            error: "❌ No hay token LTI en el body"
        });
    }

    const ltiData = validarTokenLTI(token);

    if (!ltiData) {
        return res.status(401).json({
            error: "❌ Token LTI inválido o expirado"
        });
    }

    // Guardar los datos en la request para usarlos en la ruta
    (req as any).ltiData = ltiData;

    next();
    return;
}


//TODO: Adaptar para que reciba que prueba se lanza.
router.post("/launch/:id", async (req: Request, res) => {
    //TODO: La url va a ser dinámica según la prueba.

    const { id } = req.params;

    const {CHISPA_SIMULATOR_URL, CODE_EVALUATOR_URL} = variables  
//"https://evaluador-de-codigo.vercel.app/pruebas/" : "https://simulatorchispa.netlify.app/circuit/"
    const url = id.includes("code") ? CODE_EVALUATOR_URL : CHISPA_SIMULATOR_URL
    const moodle = new MoodleConexion();

    console.log(`Lanzando prueba con id: ${id}`);
    // Aquí se podría validar que el id corresponde a una prueba válida.
    if (!id) {
        return res.status(400).send("❌ ID de prueba no proporcionado");
    }

    try {
        await moodle.validarRequest(req);
        
        const ltiData = moodle.extraerDatosLTI(req);
        const token = crearTokenLTI(ltiData);
    
        return res.redirect(`${url}${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`); //TODO: Redirigir en base a que prueba se quiere lanzar.
    } catch (err) {
        return res.status(401).send("❌ LTI Launch inválido");
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

// TODO: Eliminar este endpoint de prueba.
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
        const response = await modelo.generateResponse(prompt, "");
        return res.json(response);
    } catch (error) {
        console.error('Error al generar respuesta del modelo:', error);
        return res.status(500).json({
            error: "Error al generar respuesta del modelo",
            details: error
        });
    }
})

router.post("/calificar", async (req, res) => {
    const { codigo, idPrueba } = req.body;
    if (!codigo || !idPrueba) {
        return res.status(400).json({
            error: "Faltan parámetros: codigo e idPrueba son obligatorios"
        });
    }

    const prompt = getPromptById(idPrueba);
    if (!prompt) {
        return res.status(400).json({
            error: "ID de prueba no válido"
        });
    }
    const modelo = new CodeReviewModel(new GeminiModel())
    try {
        const response = await modelo.generateResponse(codigo, prompt.prompt);
        return res.json(response);
    } catch (error) {
        console.error('Error al generar respuesta del modelo:', error);
        return res.status(500).json({
            error: "Error al generar respuesta del modelo",
            details: error
        });
    }

})

router.post('/calificar_moodle', requireLTIBody, async (req: Request, res) => {

    try {

        const ltiData = (req as any).ltiData as LTIData;

        const { nota } = req.body
        console.log(`${nota}`)

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


router.post('/tiempo_restante', async (req: Request, res) => {
    try{
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: "Falta el token en el body"
            });
        }
        const tiempoRestante = duracionRestanteTokenLTI(token);
        if (tiempoRestante < 0) {
            return res.status(400).json({
                error: "No se pudo determinar la duración restante del token, es posible que el token sea inválido"
            });
        }

        return res.json({
            tiempoRestante
        });
    }
    catch(err){
        console.error('Error obteniendo tiempo restante:', err);
        return res.status(500).json({
            error: "Error interno al obtener tiempo restante",
            err
        });
    }
})
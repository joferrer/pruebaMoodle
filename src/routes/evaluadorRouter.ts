import { Router, Request } from "express";
import { MoodleConexion } from "@moodle/config"
import { crearTokenLTI } from "@/helpers/jwt";


export const router = Router()



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

router.post('/evaluar', async (req: Request, res) => {

    const moodle = new MoodleConexion();
    try {
        const { suma } = req.body
        console.log(`${suma}`)
        await moodle.enviarNota(0.9);
        res.send("✅ Nota enviada a Moodle");
    } catch (err) {
        res.status(500).send("❌ Error enviando nota");
    }
})

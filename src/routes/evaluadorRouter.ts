import { Router } from "express";
import { MoodleConexion} from "@moodle/config"

export const router = Router()

router.post("/lauch",async(req,res)=>{
    const moodle = new MoodleConexion();

    try {
        await moodle.validarRequest(req);

        // Aquí puedes guardar el provider en sesión, base de datos, etc.

        res.send("✔️ LTI Launch válido");
    } catch (err) {
        res.status(401).send("❌ LTI Launch inválido");
    }

})

router.post('/evaluar',async(req,res)=>{

    const moodle = new MoodleConexion();

    try {
        const {suma} = req.body
        console.log(`${suma}`)
        await moodle.enviarNota(0.9);
        res.send("✅ Nota enviada a Moodle");
    } catch (err) {
        res.status(500).send("❌ Error enviando nota");
    }
})

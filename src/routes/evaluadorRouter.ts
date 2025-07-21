import { Router } from "express";
import {ltiProvider} from "@moodle/config"

export const router = Router()

router.post('/evaluar',(req,res)=>{

    const {suma} = req.body
    console.log(`Suma: ${suma ?? "hola"}`)
    
    res.send(200)
})

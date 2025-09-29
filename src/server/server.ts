import express from 'express';
import cookieParser from 'cookie-parser';

import cors from 'cors';
import path from 'path';
import { config } from 'dotenv';

import { variables } from '@variables/variables';


import { router as evaluadorRouter } from '@routes/evaluadorRouter';

config(); // Cargar variables de entorno desde el archivo .env

class Server {
    private port: number;
    private app: express.Application;


    constructor() {
        const portEnv = variables.PORT;
        this.port = portEnv ? parseInt(portEnv) : 3000;
        this.app = express();

    }

    middlewares() {
        this.app.use(cors({
            origin: [ 
                variables.CHISPA_SIMULATOR_URL,
                variables.CODE_EVALUATOR_URL,
                "https://evaluador-de-codigo.vercel.app", 
                "https://simulatorchispa.netlify.app", 
                "https://virtualpregrado.ufps.edu.co", 
                "http://localhost:4321"
            ],
            credentials: true,
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join(__dirname, '../../public')));

        // Middleware para cookies
        this.app.use(cookieParser());
    }

    routes() {
        //this.app.use('/api', pinRouter);
        this.app.use('/api', evaluadorRouter)
    }
    start() {
        this.middlewares();
        this.routes();

        this.app.listen(this.port, () => {
            console.log(`Server is running at port ${this.port}`);
        });

    }
}

export const server = new Server(); 
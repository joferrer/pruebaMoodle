
import { config } from 'dotenv';

config();

export const variables = {
    CONSUMER_KEY: process.env.CONSUMER_KEY,
    CONSUMER_SECRET: process.env.CONSUMER_SECRET,
    JWT_SECRET: process.env.JWT_SECRET
}
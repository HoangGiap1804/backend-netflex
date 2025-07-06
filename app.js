import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/authRoutes.js';

const app = express();

dotenv.config();
app.use(express.json());

app.use('/api/auth', routes);

export default app;

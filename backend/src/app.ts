import express from 'express';
import cors from 'cors';
import { hospedeRoutes } from './rotas/HospedeRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(hospedeRoutes);

export { app };

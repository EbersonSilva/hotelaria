// src/server.ts
import { app } from './app';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});

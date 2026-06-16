# Hotelaria

Estrutura separada em duas camadas principais:

- `backend/src/` - backend com BCE, Strategy e Fachada
- `frontend/` - telas de demonstracao para apresentacao

## Frontend

O frontend agora é um app React + TypeScript com Vite.

### Como rodar

1. Entre na pasta do frontend:

```powershell
cd frontend
```

2. Instale as dependências:

```powershell
npm install
```

3. Inicie a aplicação:

```powershell
npm run dev
```

4. Acesse o endereço exibido no terminal, normalmente `http://localhost:5173`.

O painel consome a API do backend em `http://localhost:3000` e permite cadastrar, listar, buscar por CPF, inativar e reativar hóspedes.

## Backend

A base do backend fica em `backend/src/` com as entidades, estrategias, DAO, fachada e controller.

### Como rodar

1. Entre na pasta do backend:

```powershell
cd backend
```

2. Configure a conexao com o Postgres:

```powershell
$env:DATABASE_URL = "postgres://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO"
```

3. Inicie a API:

```powershell
npm run dev
```

### Rotas disponíveis

- `POST /hospedes` - cadastra um hospede com endereco
- `GET /hospedes/:cpf` - consulta um hospede pelo CPF

### Teste rapido

No Thunder Client, crie uma requisicao `POST` para `http://localhost:3000/hospedes` com o JSON de exemplo do backend. Depois use `GET http://localhost:3000/hospedes/12345678901` para validar a consulta.

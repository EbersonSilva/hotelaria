# Backend

Backend do sistema de hotelaria em TypeScript com Express.

## Persistencia

O backend usa PostgreSQL para salvar os dados. Defina a variavel `DATABASE_URL` antes de iniciar a API. Se ela nao estiver configurada, o servidor nao consegue inicializar a camada de persistencia.

## Estrutura

- `src/core/` - domínio e fachada
- `src/negocio/` - estratégias de validação
- `src/persistencia/` - DAO e contrato de persistência
- `src/adaptadores/` - controller HTTP
- `src/rotas/` - rotas Express
- `src/server.ts` - ponto de entrada da aplicação

## Scripts

- `npm run dev` - sobe o servidor em modo desenvolvimento
- `npm run build` - compila para `dist/`
- `npm start` - executa o build compilado

## Rotas

- `POST /hospedes`
- `PUT /hospedes/:cpf`
- `GET /hospedes/:cpf`

## Exemplo de body

```json
{
	"nome": "Maria Silva",
	"cpf": "12345678901",
	"dtNasc": "1995-03-10",
	"telefone": "11999999999",
	"email": "maria@exemplo.com",
	"endereco": {
		"logradouro": "Rua das Flores",
		"numero": "123",
		"complemento": "Apto 45",
		"bairro": "Centro",
		"cidade": "São Paulo",
		"estado": "SP",
		"cep": "01000000"
	}
}
```

## Resposta esperada

- `201` quando o hóspede for salvo com sucesso
- `400` quando alguma validação falhar
- `200` quando o hóspede for encontrado na consulta
- `404` quando o CPF nao existir

## Teste no Thunder Client

1. Crie uma request `POST` para `http://localhost:3000/hospedes`.
2. Cole o JSON de exemplo no body, com `Content-Type: application/json`.
3. Envie a request e confira a resposta `201`.
4. Crie uma request `PUT` para `http://localhost:3000/hospedes/12345678901`, altere campos no mesmo JSON e confira a resposta `200`.
5. Crie uma request `GET` para `http://localhost:3000/hospedes/12345678901` e valide o retorno.

## Migrations

As migrations SQL ficam em `backend/db/migrations/`. A ideia é manter scripts pequenos e aplicá-los no ambiente de produção via ferramenta de administração (pgAdmin, DBeaver, etc.) ou por `psql` quando disponível.

- `000_add_ativo.sql` — adiciona a coluna `ativo` com padrão `true` (soft delete).
- `001_add_unique_cpf.sql` — adiciona constraint UNIQUE em `cpf` (verifique duplicatas antes de aplicar).

Procedimento sugerido para aplicar uma migration via GUI:
1. Abra a conexão no seu cliente (pgAdmin, DBeaver, Azure Data Studio).
2. Abra a query editor e cole o conteúdo do arquivo SQL desejado.
3. Execute; confirme que não houve erros.

Se preferir, copie os arquivos SQL e aplique quando tiver `psql` disponível.

-- Tabelas iniciais para Hotelaria

CREATE TABLE IF NOT EXISTS enderecos (
  id SERIAL PRIMARY KEY,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT
);

CREATE TABLE IF NOT EXISTS hospedes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf VARCHAR(14) NOT NULL, 
  email TEXT,
  endereco_id INTEGER REFERENCES enderecos(id),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);
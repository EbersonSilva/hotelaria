-- Migration: 001_add_unique_cpf.sql
-- Objetivo: adicionar constraint UNIQUE em `hospedes.cpf`
-- ATENÇÃO: verifique duplicatas antes de aplicar esta migration.

-- 0) (Recomendado) Checar duplicatas com:
-- SELECT cpf, count(*) FROM hospedes GROUP BY cpf HAVING count(*) > 1;

-- 1) Se não houver duplicatas, aplicar a constraint:
ALTER TABLE hospedes ADD CONSTRAINT hospedes_cpf_unique UNIQUE (cpf);

-- Observação: esta alteração pode travar a tabela enquanto a constraint é criada.
-- Em bases muito grandes prefira criar índice único CONCURRENTLY após limpeza de duplicatas.

-- Fim migration 001_add_unique_cpf.sql

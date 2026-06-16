-- Migration: 000_add_ativo.sql
-- Objetivo: adicionar a coluna `ativo` em `hospedes` (soft delete)
-- Observação: este script é seguro para executar em GUIs (pgAdmin/DBeaver).

-- 1) Adiciona a coluna (se não existir)
ALTER TABLE hospedes ADD COLUMN IF NOT EXISTS ativo BOOLEAN;

-- 2) Marca registros existentes como ativos (evita NULLs)
UPDATE hospedes SET ativo = true WHERE ativo IS NULL;

-- 3) Define valor padrão e not null
ALTER TABLE hospedes ALTER COLUMN ativo SET DEFAULT true;
ALTER TABLE hospedes ALTER COLUMN ativo SET NOT NULL;

-- Fim migration 000_add_ativo.sql

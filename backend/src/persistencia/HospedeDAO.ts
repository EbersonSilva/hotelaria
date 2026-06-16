import { EntidadeDominio } from '../core/dominio/EntidadeDominio';
import { Hospede } from '../core/dominio/Hospede';
import { IDAO } from './IDAO';
import { pool } from './db';

export class HospedeDAO implements IDAO {
  async salvar(entidade: EntidadeDominio): Promise<void> {
    const hospede = entidade as Hospede;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertEndereco = `INSERT INTO enderecos (logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`;
      const resEnd = await client.query(insertEndereco, [
        hospede.endereco?.logradouro ?? null,
        hospede.endereco?.numero ?? null,
        hospede.endereco?.complemento ?? null,
        hospede.endereco?.bairro ?? null,
        hospede.endereco?.cidade ?? null,
        hospede.endereco?.estado ?? null,
        hospede.endereco?.cep ?? null,
      ]);
      const enderecoId = resEnd.rows[0]?.id ?? null;

      const insertHospede = `INSERT INTO hospedes (nome, cpf, dt_nasc, telefone, email, endereco_id, ativo) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
      await client.query(insertHospede, [
        hospede.nome,
        hospede.cpf,
        hospede.dtNasc ?? null,
        hospede.telefone ?? null,
        hospede.email ?? null,
        enderecoId,
        hospede.ativo,
      ]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[DAO] Erro ao salvar hóspede:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async alterar(_entidade: EntidadeDominio): Promise<void> {
    const hospede = _entidade as Hospede;

    if (!hospede.cpf) {
      throw new Error('CPF é obrigatório para alterar o hóspede.');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const hospedeAtual = await client.query(
        'SELECT id, endereco_id FROM hospedes WHERE cpf = $1 FOR UPDATE',
        [hospede.cpf],
      );

      if (hospedeAtual.rowCount === 0) {
        throw new Error('Hóspede não encontrado.');
      }

      const enderecoId = hospedeAtual.rows[0]?.endereco_id ?? null;

      if (enderecoId) {
        await client.query(
          'UPDATE enderecos SET logradouro = $1, numero = $2, complemento = $3, bairro = $4, cidade = $5, estado = $6, cep = $7 WHERE id = $8',
          [
            hospede.endereco?.logradouro ?? null,
            hospede.endereco?.numero ?? null,
            hospede.endereco?.complemento ?? null,
            hospede.endereco?.bairro ?? null,
            hospede.endereco?.cidade ?? null,
            hospede.endereco?.estado ?? null,
            hospede.endereco?.cep ?? null,
            enderecoId,
          ],
        );
      } else {
        const insertEndereco = `INSERT INTO enderecos (logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`;
        const resEnd = await client.query(insertEndereco, [
          hospede.endereco?.logradouro ?? null,
          hospede.endereco?.numero ?? null,
          hospede.endereco?.complemento ?? null,
          hospede.endereco?.bairro ?? null,
          hospede.endereco?.cidade ?? null,
          hospede.endereco?.estado ?? null,
          hospede.endereco?.cep ?? null,
        ]);

        await client.query('UPDATE hospedes SET endereco_id = $1 WHERE cpf = $2', [resEnd.rows[0]?.id ?? null, hospede.cpf]);
      }

      await client.query(
        'UPDATE hospedes SET nome = $1, dt_nasc = $2, telefone = $3, email = $4, ativo = $5 WHERE cpf = $6',
        [
          hospede.nome,
          hospede.dtNasc ?? null,
          hospede.telefone ?? null,
          hospede.email ?? null,
          hospede.ativo,
          hospede.cpf,
        ],
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[DAO] Erro ao alterar hóspede:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async inativar(_entidade: EntidadeDominio): Promise<void> {
    const cpf = (_entidade as Hospede).cpf;
    if (!cpf) {
      throw new Error('CPF é obrigatório para inativar o hóspede.');
    }

    await pool.query('UPDATE hospedes SET ativo = false WHERE cpf = $1', [cpf]);
  }

  async reativar(_entidade: EntidadeDominio): Promise<void> {
    const cpf = (_entidade as Hospede).cpf;
    if (!cpf) {
      throw new Error('CPF é obrigatório para reativar o hóspede.');
    }

    await pool.query('UPDATE hospedes SET ativo = true WHERE cpf = $1', [cpf]);
  }

  async consultar(_entidade: EntidadeDominio): Promise<EntidadeDominio[]> {
    const consulta = _entidade as Hospede & { ativos?: string };
    const cpf = consulta.cpf;
    const ativos = consulta.ativos;

    const filtroAtivo = ativos === 'false' ? 'h.ativo = false' : ativos === 'all' ? '1=1' : 'h.ativo = true';

    if (cpf) {
      const res = await pool.query(
        `SELECT h.*, e.* FROM hospedes h LEFT JOIN enderecos e ON e.id = h.endereco_id WHERE h.cpf = $1 AND ${filtroAtivo}`,
        [cpf],
      );
      return res.rows as EntidadeDominio[];
    }

    const res = await pool.query(
      `SELECT h.*, e.* FROM hospedes h LEFT JOIN enderecos e ON e.id = h.endereco_id WHERE ${filtroAtivo}`,
    );
    return res.rows as EntidadeDominio[];
  }
}

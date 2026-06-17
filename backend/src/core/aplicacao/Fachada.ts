import { EntidadeDominio } from '../dominio/EntidadeDominio';
import { ValidarCPF } from '../../negocio/ValidarCPF';
import { ValidarEmail } from '../../negocio/ValidarEmail';
import { HospedeDAO } from '../../persistencia/HospedeDAO';
import { IStrategy } from '../../negocio/IStrategy';
import { IDAO } from '../../persistencia/IDAO';

export class Fachada {
  private daos: Map<string, IDAO> = new Map();
  private rns: Map<string, IStrategy[]> = new Map();

  constructor() {
    this.daos.set('HOSPEDE', new HospedeDAO());

    this.rns.set('SALVAR_HOSPEDE', [new ValidarCPF(), new ValidarEmail()]);
  }

  async salvar(entidade: EntidadeDominio, contexto: string): Promise<string | null> {
    const regras = this.rns.get(`SALVAR_${contexto}`) || [];

    for (const regra of regras) {
      const erro = await regra.processar(entidade);
      if (erro) return erro;
    }

    const dao = this.daos.get(contexto);
    if (dao) {
      await dao.salvar(entidade);
      return null;
    }

    return 'DAO não encontrado para o contexto.';
  }

  async alterar(entidade: EntidadeDominio, contexto: string): Promise<string | null> {
    const regras = this.rns.get(`SALVAR_${contexto}`) || [];

    for (const regra of regras) {
      const erro = await regra.processar(entidade);
      if (erro) return erro;
    }

    const dao = this.daos.get(contexto);
    if (dao) {
      await dao.alterar(entidade);
      return null;
    }

    return 'DAO não encontrado para o contexto.';
  }

  async consultar(entidade: EntidadeDominio, contexto: string): Promise<EntidadeDominio[]> {
    const dao = this.daos.get(contexto);
    if (!dao) throw new Error('DAO não encontrado para o contexto.');

    const resultados = await dao.consultar(entidade);
    return resultados;
  }

  async inativar(entidade: EntidadeDominio, contexto: string): Promise<void> {
    const dao = this.daos.get(contexto);
    if (!dao) throw new Error('DAO não encontrado para o contexto.');

    await dao.inativar(entidade);
  }

  async reativar(entidade: EntidadeDominio, contexto: string): Promise<void> {
    const dao = this.daos.get(contexto);
    if (!dao) throw new Error('DAO não encontrado para o contexto.');

    // @ts-ignore - IDAO now defines reativar, but keep runtime safety
    await (dao as any).reativar(entidade);
  }

  
}

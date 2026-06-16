import { EntidadeDominio } from '../core/dominio/EntidadeDominio';
import { Hospede } from '../core/dominio/Hospede';
import { IStrategy } from './IStrategy';

export class ValidarCPF implements IStrategy {
  async processar(entidade: EntidadeDominio): Promise<string | null> {
    if (!(entidade instanceof Hospede)) {
      return null;
    }

    const cpf = (entidade.cpf ?? '').replace(/\D/g, '');

    if (cpf.length !== 11) {
      return 'CPF Inválido! Deve conter 11 dígitos.';
    }

    return null;
  }
}

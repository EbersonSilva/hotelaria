import { EntidadeDominio } from '../core/dominio/EntidadeDominio';
import { Hospede } from '../core/dominio/Hospede';
import { IStrategy } from './IStrategy';

export class ValidarEmail implements IStrategy {
  async processar(entidade: EntidadeDominio): Promise<string | null> {
    if (!(entidade instanceof Hospede)) {
      return null;
    }

    const email = (entidade.email ?? '').trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      return 'E-mail inválido.';
    }

    return null;
  }
}

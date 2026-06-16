import { EntidadeDominio } from '../core/dominio/EntidadeDominio';

export interface IStrategy {
  processar(entidade: EntidadeDominio): Promise<string | null>;
}

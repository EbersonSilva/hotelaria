import { EntidadeDominio } from '../core/dominio/EntidadeDominio';

export interface IDAO {
  salvar(entidade: EntidadeDominio): Promise<void>;
  alterar(entidade: EntidadeDominio): Promise<void>;
  inativar(entidade: EntidadeDominio): Promise<void>;
  reativar(entidade: EntidadeDominio): Promise<void>;
  consultar(entidade: EntidadeDominio): Promise<EntidadeDominio[]>;
}

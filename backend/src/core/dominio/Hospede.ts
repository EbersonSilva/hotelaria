import { EntidadeDominio } from './EntidadeDominio';
import { Endereco } from './Endereco';

export class Hospede extends EntidadeDominio {
  constructor(
    public nome: string,
    public cpf: string,
    public dtNasc: string,
    public telefone: string,
    public email: string,
    public endereco: Endereco,
    public ativo: boolean = true,
  ) {
    super();
  }
}

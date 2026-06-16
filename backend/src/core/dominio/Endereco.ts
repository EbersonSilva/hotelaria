import { EntidadeDominio } from './EntidadeDominio';

export class Endereco extends EntidadeDominio {
  constructor(
    public logradouro?: string,
    public numero?: string,
    public complemento?: string,
    public bairro?: string,
    public cidade?: string,
    public estado?: string,
    public cep?: string,
    id?: number,
  ) {
    super();
  }
}

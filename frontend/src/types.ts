export type HospedeApi = {
  id?: number;
  nome?: string;
  cpf?: string;
  dt_nasc?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  endereco_id?: number;
  criado_em?: string;
};

export type HospedeForm = {
  nome: string;
  cpf: string;
  dtNasc: string;
  telefone: string;
  email: string;
  ativo: boolean;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
};

export type FilterMode = 'true' | 'false' | 'all';

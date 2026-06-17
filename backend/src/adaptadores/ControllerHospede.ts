import { Fachada } from '../core/aplicacao/Fachada';
import { Endereco } from '../core/dominio/Endereco';
import { Hospede } from '../core/dominio/Hospede';

export class ControllerHospede {
  constructor(private readonly fachada: Fachada = new Fachada()) {}

  private normalizarAtivo(body: any): boolean {
    if (typeof body.ativo === 'boolean') {
      return body.ativo;
    }

    const status = String(body.status ?? '').trim().toLowerCase();


    if (['false', 'inativo', 'inativa', 'inactive'].includes(status)) {
      return false;
    }

    return true;
  }

  private criarHospede(body: any, cpfFallback = ''): Hospede {
    const enderecoBody = body.endereco ?? {};
    

    const camposObrigatorios = [
      body.nome,
      body.cpf ?? cpfFallback,
      body.telefone,  
      body.email,
      enderecoBody.logradouro,
      enderecoBody.numero,
      enderecoBody.bairro,
      enderecoBody.cidade,
      enderecoBody.estado,
      enderecoBody.cep
    ];

    // Verifica se algum campo está vazio, nulo ou é apenas espaços em branco
    const possuiCampoVazio = camposObrigatorios.some(
      campo => campo === undefined || campo === null || String(campo).trim() === ''
    );

    if (possuiCampoVazio) {
      throw new Error('Campos obrigatórios ausentes. Preencha todos os dados do hóspede e do endereço.');
    }

    const emailTexto = String(body.email ?? '').trim();

    // Instanciação normal das entidades (O seu código original)
    const endereco = new Endereco(
      enderecoBody.logradouro,
      enderecoBody.numero,
      enderecoBody.complemento,
      enderecoBody.bairro,
      enderecoBody.cidade,
      enderecoBody.estado,
      enderecoBody.cep,
      enderecoBody.id,
    );

    return new Hospede(
      body.nome,
      body.cpf ?? cpfFallback,
      body.dtNasc,
      body.telefone,
      emailTexto,
      endereco,
      this.normalizarAtivo(body),
    );
  }

  // private criarHospede(body: any, cpfFallback = ''): Hospede {
  //   const enderecoBody = body.endereco ?? {};

  //   const endereco = new Endereco(
  //     enderecoBody.logradouro,
  //     enderecoBody.numero,
  //     enderecoBody.complemento,
  //     enderecoBody.bairro,
  //     enderecoBody.cidade,
  //     enderecoBody.estado,
  //     enderecoBody.cep,
  //     enderecoBody.id,
  //   );

  //   return new Hospede(
  //     body.nome,
  //     body.cpf ?? cpfFallback,
  //     body.dtNasc,
  //     body.telefone,
  //     body.email,
  //     endereco,
  //     this.normalizarAtivo(body),
  //   );
  // }

  // async salvar(req: any, res: any): Promise<void> {
  //   const hospede = this.criarHospede(req.body ?? {});

  //   const erro = await this.fachada.salvar(hospede, 'HOSPEDE');

  //   if (erro) {
  //     res.status?.(400)?.json?.({ erro });
  //     return;
  //   }

  //   res.status?.(201)?.json?.({ mensagem: 'Hospede salvo com sucesso.' });
  // }

  async salvar(req: any, res: any): Promise<void> {
    try {
      const corpo = req.body ?? {};
      const cpfDigitado = String(corpo.cpf ?? '').trim();

      if (cpfDigitado) {
        // Cria um objeto temporário só para consultar se o CPF já existe no banco
        const hospedeProcura = new Hospede('', cpfDigitado, '', '', '', new Endereco('', '', '', '', '', '', ''));
        
        // Alinha a busca para trazer qualquer registro (ativo ou inativo)
        (hospedeProcura as any).ativos = 'all'; 

        const jáExiste = await this.fachada.consultar(hospedeProcura, 'HOSPEDE');

        // Se o banco retornar algum hóspede com esse CPF, barra o cadastro
        if (jáExiste && jáExiste.length > 0) {
          res.status?.(400)?.json?.({ erro: 'Não foi possível cadastrar: Este CPF já está cadastrado no sistema.' });
          return;
        }
      }

      // 2. SE NÃO EXISTIR, SEGUE O FLUXO NORMAL (Seu código original com o try/catch)
      const hospede = this.criarHospede(corpo);
      const erro = await this.fachada.salvar(hospede, 'HOSPEDE');

      if (erro) {
        res.status?.(400)?.json?.({ erro });
        return;
      }

      res.status?.(201)?.json?.({ mensagem: 'Hospede salvo com sucesso.' });
    } catch (err: any) {
      res.status?.(400)?.json?.({ erro: err.message });
    }
  }

  async alterar(req: any, res: any): Promise<void> {
    const cpf = req.params?.cpf ?? req.body?.cpf;
    if (!cpf) {
      res.status?.(400)?.json?.({ erro: 'CPF e obrigatorio.' });
      return;
    }

    const hospede = this.criarHospede({ ...(req.body ?? {}), cpf });

    try {
      const erro = await this.fachada.alterar(hospede, 'HOSPEDE');

      if (erro) {
        res.status?.(400)?.json?.({ erro });
        return;
      }

      res.status?.(200)?.json?.({ mensagem: 'Hospede atualizado com sucesso.' });
    } catch (err: any) {
      console.error('[Controller] Erro ao alterar hospede:', err);
      const naoEncontrado = typeof err?.message === 'string' && err.message.toLowerCase().includes('encontrado');
      res.status?.(naoEncontrado ? 404 : 500)?.json?.({
        erro: naoEncontrado ? 'Hospede nao encontrado.' : 'Erro interno ao alterar hospede.',
      });
    }
  }

  async consultar(req: any, res: any): Promise<void> {
    const cpf = req.params?.cpf ?? req.query?.cpf;
    if (!cpf) {
      res.status?.(400)?.json?.({ erro: 'CPF e obrigatorio.' });
      return;
    }

    const hospede = new Hospede('', cpf, '', '', '', new Endereco('', '', '', '', '', '', ''));
    (hospede as any).ativos = req.query?.ativos;

    try {
      const resultados = await this.fachada.consultar(hospede, 'HOSPEDE');
      if (!resultados || resultados.length === 0) {
        res.status?.(404)?.json?.({ mensagem: 'Hospede nao encontrado.' });
        return;
      }

      res.status?.(200)?.json?.(resultados[0]);
    } catch (err: any) {
      console.error('[Controller] Erro ao consultar hospede:', err);
      res.status?.(500)?.json?.({ erro: 'Erro interno ao consultar hospede.' });
    }
  }

  

  async listar(req: any, res: any): Promise<void> {
    try {
      const hospede = new Hospede('', '', '', '', '', new Endereco('', '', '', '', '', '', ''));
      (hospede as any).ativos = req.query?.ativos;
      const resultados = await this.fachada.consultar(hospede, 'HOSPEDE');
      res.status?.(200)?.json?.(resultados);
    } catch (err: any) {
      console.error('[Controller] Erro ao listar hospedes:', err);
      res.status?.(500)?.json?.({ erro: 'Erro interno ao listar hospedes.' });
    }
  }

  async inativar(req: any, res: any): Promise<void> {
    const cpf = req.params?.cpf;
    if (!cpf) {
      res.status?.(400)?.json?.({ erro: 'CPF e obrigatorio.' });
      return;
    }

    try {
      const hospede = new Hospede('', cpf, '', '', '', new Endereco('', '', '', '', '', '', ''));
      await this.fachada.inativar(hospede, 'HOSPEDE');
      res.status?.(200)?.json?.({ mensagem: 'Hospede inativado com sucesso.' });
    } catch (err: any) {
      console.error('[Controller] Erro ao inativar hospede:', err);
      res.status?.(500)?.json?.({ erro: 'Erro interno ao inativar hospede.' });
    }
  }

  async reativar(req: any, res: any): Promise<void> {
    const cpf = req.params?.cpf;
    if (!cpf) {
      res.status?.(400)?.json?.({ erro: 'CPF e obrigatorio.' });
      return;
    }

    try {
      const hospede = new Hospede('', cpf, '', '', '', new Endereco('', '', '', '', '', '', ''));
      await this.fachada.reativar(hospede, 'HOSPEDE');
      res.status?.(200)?.json?.({ mensagem: 'Hospede reativado com sucesso.' });
    } catch (err: any) {
      console.error('[Controller] Erro ao reativar hospede:', err);
      res.status?.(500)?.json?.({ erro: 'Erro interno ao reativar hospede.' });
    }
  }
}

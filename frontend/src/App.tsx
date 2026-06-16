import { useEffect, useMemo, useState } from 'react';
import {
  createGuest,
  getApiBaseUrl,
  inactivateGuest,
  listGuests,
  reactivateGuest,
  setApiBaseUrl,
  updateGuest,
} from './api';
import type { FilterMode, HospedeApi, HospedeForm } from './types';

type Section = 'dashboard' | 'cadastro' | 'hospedes';

type Toast = {
  tone: 'success' | 'danger' | 'neutral';
  message: string;
};

const emptyForm: HospedeForm = {
  nome: '',
  cpf: '',
  dtNasc: '',
  telefone: '',
  email: '',
  ativo: true,
  endereco: {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  },
};

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}

function toDateInputValue(value?: string) {
  if (!value) return '';
  return value.includes('T') ? value.slice(0, 10) : value;
}

function guestToForm(item: HospedeApi): HospedeForm {
  return {
    nome: item.nome ?? '',
    cpf: item.cpf ?? '',
    dtNasc: toDateInputValue(item.dt_nasc),
    telefone: item.telefone ?? '',
    email: item.email ?? '',
    ativo: item.ativo !== false,
    endereco: {
      logradouro: item.logradouro ?? '',
      numero: item.numero ?? '',
      complemento: item.complemento ?? '',
      bairro: item.bairro ?? '',
      cidade: item.cidade ?? '',
      estado: item.estado ?? '',
      cep: item.cep ?? '',
    },
  };
}

function normalizeApiGuest(item: HospedeApi) {
  const addressParts = [item.logradouro, item.numero, item.bairro, item.cidade, item.estado]
    .filter(Boolean)
    .join(' • ');

  return {
    id: item.id,
    nome: item.nome ?? '-',
    cpf: item.cpf ?? '-',
    email: item.email ?? '-',
    telefone: item.telefone ?? '-',
    ativo: item.ativo !== false,
    nascimento: formatDate(item.dt_nasc),
    endereco: addressParts || '-',
  };
}

function App() {
  const [section, setSection] = useState<Section>('dashboard');
  const [filter, setFilter] = useState<FilterMode>('true');
  const [apiBaseUrl, setApiBaseUrlState] = useState(() => getApiBaseUrl());
  const [guestForm, setGuestForm] = useState<HospedeForm>(emptyForm);
  const [guests, setGuests] = useState<HospedeApi[]>([]);
  const [guestStatus, setGuestStatus] = useState('Carregue a lista para começar.');
  const [formStatus, setFormStatus] = useState('Preencha os dados e salve no banco.');
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [searchCpf, setSearchCpf] = useState('');
  const [editingCpf, setEditingCpf] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    setApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  async function refreshGuests(currentFilter: FilterMode = filter) {
    setLoadingGuests(true);
    setGuestStatus('Carregando hóspedes...');

    try {
      const data = await listGuests(currentFilter);
      setGuests(data);
      setGuestStatus(`${data.length} hóspede(s) carregado(s).`);
    } catch (error) {
      setGuestStatus(error instanceof Error ? error.message : 'Erro ao carregar hóspedes.');
      setGuests([]);
    } finally {
      setLoadingGuests(false);
    }
  }

  useEffect(() => {
    void refreshGuests(filter);
  }, [filter]);

  const normalizedGuests = useMemo(() => guests.map(normalizeApiGuest), [guests]);

  const stats = useMemo(() => {
    const active = normalizedGuests.filter((guest) => guest.ativo).length;
    const inactive = normalizedGuests.length - active;
    return [
      { label: 'Total', value: normalizedGuests.length.toString(), note: 'registros carregados' },
      { label: 'Ativos', value: active.toString(), note: 'em operação' },
      { label: 'Inativos', value: inactive.toString(), note: 'soft delete' },
    ];
  }, [normalizedGuests]);

  function showToast(message: string, tone: Toast['tone'] = 'neutral') {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3500);
  }

  async function handleSaveGuest() {
    if (!guestForm.nome.trim() || !guestForm.cpf.trim()) {
      setFormStatus('Nome e CPF são obrigatórios.');
      return;
    }

    setLoadingForm(true);
    setFormStatus(editingCpf ? 'Atualizando cadastro...' : 'Enviando cadastro...');

    try {
      const response = editingCpf
        ? await updateGuest(editingCpf, guestForm)
        : await createGuest(guestForm);
      setFormStatus(response.mensagem || 'Hóspede salvo com sucesso.');
      showToast(response.mensagem || 'Hóspede salvo com sucesso.', 'success');
      setGuestForm(emptyForm);
      setEditingCpf(null);
      setSection('hospedes');
      await refreshGuests(filter);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao salvar hóspede.';
      setFormStatus(message);
      showToast(message, 'danger');
    } finally {
      setLoadingForm(false);
    }
  }

  function handleEditGuest(guest: HospedeApi) {
    const cpf = guest.cpf ?? '';

    if (!cpf) {
      showToast('Nao foi possivel editar: CPF nao encontrado.', 'danger');
      return;
    }

    setGuestForm(guestToForm(guest));
    setEditingCpf(cpf);
    setFormStatus('Edite os dados e clique em Atualizar hospede.');
    setSection('cadastro');
  }

  function handleCancelEdit() {
    setGuestForm(emptyForm);
    setEditingCpf(null);
    setFormStatus('Preencha os dados e salve no banco.');
  }

  async function handleRowAction(cpf: string, active: boolean) {
    try {
      setGuestStatus(active ? 'Inativando hóspede...' : 'Reativando hóspede...');
      const response = active ? await inactivateGuest(cpf) : await reactivateGuest(cpf);
      showToast(response.mensagem || 'Operação realizada.', 'success');
      await refreshGuests(filter);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir a ação.';
      setGuestStatus(message);
      showToast(message, 'danger');
    }
  }

  async function handleSearchCpf() {
    if (!searchCpf.trim()) {
      setGuestStatus('Digite um CPF para consultar.');
      return;
    }

    setLoadingGuests(true);
    setGuestStatus('Buscando hóspede...');

    try {
      const response = await fetch(`${getApiBaseUrl()}/hospedes/${searchCpf.trim()}?ativos=${filter}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Hóspede não encontrado.');
      }

      setGuests([data]);
      setGuestStatus('Hóspede encontrado.');
      setSection('hospedes');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hóspede não encontrado.';
      setGuestStatus(message);
      setGuests([]);
      showToast(message, 'danger');
    } finally {
      setLoadingGuests(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">H</div>
          <div>
            <p className="eyebrow">Hotelaria</p>
            {/* <h1>GuestFlow</h1> */}
            {/* <p className="sidebar-text">
              CRUD em React + TypeScript para cadastro, consulta e manutenção de hóspedes.
            </p> */}
          </div>
        </div>

        <nav className="nav-stack">
          <button className={section === 'dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => setSection('dashboard')}>
            Dashboard
          </button>
          <button className={section === 'cadastro' ? 'nav-item active' : 'nav-item'} onClick={() => setSection('cadastro')}>
            Cadastro
          </button>
          <button className={section === 'hospedes' ? 'nav-item active' : 'nav-item'} onClick={() => setSection('hospedes')}>
            Hóspedes
          </button>
        </nav>

        {/* <div className="sidebar-card">
          <span>API base</span>
          <strong>{apiBaseUrl}</strong>
          <small>Atualize a URL se o backend rodar em outra porta ou ambiente.</small>
        </div> */}
      </aside>

      <main className="main-content">
        <header className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Sistema de hotelaria</p>
            {/* <h2>Interface pronta para apresentar e evoluir depois</h2> */}
            <p>
              Layout responsivo com formulário, métricas e listagem integrada às rotas do backend.
            </p>
          </div>

          <div className="hero-controls">
            {/* <label className="field field-inline">
              <span>Base da API</span>
              <input value={apiBaseUrl} onChange={(event) => setApiBaseUrlState(event.target.value)} placeholder="http://localhost:3000" />
            </label> */}
            {/* <button className="button button-secondary" onClick={() => void refreshGuests(filter)}>
              Atualizar dados
            </button> */}
          </div>
        </header>

        <section className="stats-grid">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </article>
          ))}
        </section>

        {section === 'dashboard' && (
          <section className="panel-grid">
            {/* <article className="info-card accent">
              <p className="card-label">Cadastro</p>
              <h3>Salvar hóspedes com endereço</h3>
              <p>O formulário envia para <strong>POST /hospedes</strong> e persiste no PostgreSQL.</p>
            </article> */}
            {/* <article className="info-card">
              <p className="card-label">Consulta</p>
              <h3>Listagem com filtro</h3>
              <p>Você alterna entre ativos, inativos ou todos e pode buscar por CPF.</p>
            </article>
            <article className="info-card dark">
              <p className="card-label">Manutenção</p>
              <h3>Inativar e reativar</h3>
              <p>Fluxo completo sem deletar dados, ideal para apresentação e uso futuro.</p>
            </article> */}
          </section>
        )}

        {section === 'cadastro' && (
          <section className="workspace-grid">
            <div className="section-card">
              <div className="section-head">
                <div>
                  <p className="card-label">{editingCpf ? 'Edicao' : 'Novo registro'}</p>
                  <h3>Cadastro de hóspede</h3>
                </div>
                <button className="button button-primary" onClick={() => void handleSaveGuest()} disabled={loadingForm}>
                  {loadingForm ? 'Salvando...' : 'Salvar hóspede'}
                </button>
              </div>

              <div className="form-grid">
                <Field label="Nome" value={guestForm.nome} onChange={(value) => setGuestForm({ ...guestForm, nome: value })}  placeholder="Nome completo" />
                <Field label="CPF" value={guestForm.cpf} onChange={(value) => setGuestForm({ ...guestForm, cpf: value })} placeholder="00000000000" disabled={Boolean(editingCpf)} />
                <Field label="Data de nascimento" type="date" value={guestForm.dtNasc} onChange={(value) => setGuestForm({ ...guestForm, dtNasc: value })} />
                <Field label="Telefone" value={guestForm.telefone} onChange={(value) => setGuestForm({ ...guestForm, telefone: value })} placeholder="(00) 00000-0000" />
                <Field label="E-mail" value={guestForm.email} onChange={(value) => setGuestForm({ ...guestForm, email: value })} placeholder="nome@exemplo.com" />
                {/* <label className="field">
                  <span>Status</span>
                  <select value={guestForm.ativo ? 'true' : 'false'} onChange={(event) => setGuestForm({ ...guestForm, ativo: event.target.value === 'true' })}>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </label> */}
                <Field label="CEP" value={guestForm.endereco.cep} onChange={(value) => setGuestForm({ ...guestForm, endereco: { ...guestForm.endereco, cep: value } })} placeholder="00000-000" />
                <Field label="Logradouro" full value={guestForm.endereco.logradouro} onChange={(value) => setGuestForm({ ...guestForm, endereco: { ...guestForm.endereco, logradouro: value } })} placeholder="Rua, avenida, travessa..." />
                <Field label="Número" value={guestForm.endereco.numero} onChange={(value) => setGuestForm({ ...guestForm, endereco: { ...guestForm.endereco, numero: value } })} placeholder="123" />
                <Field label="Complemento" value={guestForm.endereco.complemento} onChange={(value) => setGuestForm({ ...guestForm, endereco: { ...guestForm.endereco, complemento: value } })} placeholder="Apto, bloco, sala..." />
                <Field label="Bairro" value={guestForm.endereco.bairro} onChange={(value) => setGuestForm({ ...guestForm, endereco: { ...guestForm.endereco, bairro: value } })} placeholder="Centro" />
                <Field label="Cidade" value={guestForm.endereco.cidade} onChange={(value) => setGuestForm({ ...guestForm, endereco: { ...guestForm.endereco, cidade: value } })} placeholder="São Paulo" />
                <Field label="Estado" value={guestForm.endereco.estado} onChange={(value) => setGuestForm({ ...guestForm, endereco: { ...guestForm.endereco, estado: value } })} placeholder="SP" />
              </div>

              <p className="message-bar">{formStatus}</p>
              {editingCpf && (
                <button className="button button-secondary edit-cancel-button" onClick={handleCancelEdit} disabled={loadingForm}>
                  Cancelar edicao
                </button>
              )}
            </div>

            {/* <aside className="side-card">
              <p className="card-label">Checklist</p>
              <ul className="checklist">
                <li>Salvar no banco usando o backend já pronto.</li>
                <li>Exibir lista dinâmica com inativação e reativação.</li>
                <li>Buscar um hóspede específico por CPF.</li>
                <li>Trocar a URL da API no próprio painel.</li>
              </ul>
            </aside> */}
          </section>
        )}

        {section === 'hospedes' && (
          <section className="section-card">
            <div className="section-head wrap">
              <div>
                <p className="card-label">Consulta</p>
                <h3>Lista de hóspedes</h3>
              </div>

              <div className="toolbar">
                <div className="segmented">
                  {(['true', 'false', 'all'] as FilterMode[]).map((option) => (
                    <button key={option} className={filter === option ? 'segmented-button active' : 'segmented-button'} onClick={() => setFilter(option)}>
                      {option === 'true' ? 'Ativos' : option === 'false' ? 'Inativos' : 'Todos'}
                    </button>
                  ))}
                </div>

                <div className="search-block">
                  <input value={searchCpf} onChange={(event) => setSearchCpf(event.target.value)} placeholder="Buscar por CPF" />
                  <button className="button button-secondary" onClick={() => void handleSearchCpf()}>
                    Buscar
                  </button>
                  <button className="button button-primary" onClick={() => void refreshGuests(filter)} disabled={loadingGuests}>
                    {loadingGuests ? 'Carregando...' : 'Atualizar'}
                  </button>
                </div>
              </div>
            </div>

            <p className="message-bar">{guestStatus}</p>

            <div className="table-shell">
              <div className="table-head-row">
                <span>Nome</span>
                <span>CPF</span>
                <span>E-mail</span>
                <span>Telefone</span>
                <span>Status</span>
                <span>Ações</span>
              </div>

              <div className="table-body">
                {normalizedGuests.length === 0 ? (
                  <div className="table-row empty-row">
                    <span>Nenhum hóspede encontrado.</span>
                  </div>
                ) : (
                  guests.map((guestItem) => {
                    const guest = normalizeApiGuest(guestItem);

                    return (
                    <div className="table-row" key={guest.cpf}>
                      <span>
                        <strong>{guest.nome}</strong>
                        <small>{guest.endereco}</small>
                      </span>
                      <span>{guest.cpf}</span>
                      <span>{guest.email}</span>
                      <span>{guest.telefone}</span>
                      <span>
                        <span className={guest.ativo ? 'badge badge-active' : 'badge badge-inactive'}>{guest.ativo ? 'Ativo' : 'Inativo'}</span>
                      </span>
                      <span className="row-actions">
                        <button className="button button-mini" onClick={() => handleEditGuest(guestItem)}>
                          Editar
                        </button>
                        <button className="button button-mini" onClick={() => void handleRowAction(guest.cpf, guest.ativo)}>
                          {guest.ativo ? 'Inativar' : 'Reativar'}
                        </button>
                      </span>
                      
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {toast && (
        <div className={`toast toast-${toast.tone}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  full?: boolean;
};

// function Field({ label, value, onChange, placeholder, type = 'text', full }: FieldProps) {
//   return (
//     <label className={full ? 'field field-full' : 'field'}>
//       <span>{label}</span>
//       <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
//     </label>
//   );
// }

function Field({ label, value, onChange, placeholder, type = 'text', full, disabled }: FieldProps & { disabled?: boolean }) {
  return (
    <label className={full ? 'field field-full' : 'field'}>
      <span>{label}</span>
      <input 
        type={type} 
        value={value} 
        placeholder={placeholder} 
        onChange={(event) => onChange(event.target.value)} 
        disabled={disabled} /* 🟨 ESSA LINHA TRAVA O CAMPO QUANDO FOR EDIÇÃO */
      />
    </label>
  );
}

export default App;

import type { FilterMode, HospedeApi, HospedeForm } from './types';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const STORAGE_KEY = 'hotelaria_api_base_url';

export function getApiBaseUrl() {
  return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_API_URL || DEFAULT_BASE_URL;
}

export function setApiBaseUrl(value: string) {
  localStorage.setItem(STORAGE_KEY, value);
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.erro || data?.message || 'Erro na requisição';
    throw new Error(message);
  }

  return data as T;
}

export async function listGuests(filter: FilterMode) {
  const baseUrl = getApiBaseUrl();
  return requestJson<HospedeApi[]>(`${baseUrl}/hospedes?ativos=${filter}`);
}

export async function createGuest(payload: HospedeForm) {
  const baseUrl = getApiBaseUrl();
  return requestJson<{ mensagem?: string }>(`${baseUrl}/hospedes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateGuest(cpf: string, payload: HospedeForm) {
  const baseUrl = getApiBaseUrl();
  return requestJson<{ mensagem?: string }>(`${baseUrl}/hospedes/${cpf}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function inactivateGuest(cpf: string) {
  const baseUrl = getApiBaseUrl();
  return requestJson<{ mensagem?: string }>(`${baseUrl}/hospedes/${cpf}`, {
    method: 'DELETE',
  });
}

export async function reactivateGuest(cpf: string) {
  const baseUrl = getApiBaseUrl();
  return requestJson<{ mensagem?: string }>(`${baseUrl}/hospedes/${cpf}/reativar`, {
    method: 'POST',
  });
}

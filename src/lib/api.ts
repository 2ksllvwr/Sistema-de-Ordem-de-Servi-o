const API_URL = import.meta.env.VITE_API_URL?.trim() ?? "";

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function isApiConfigured() {
  return Boolean(API_URL);
}

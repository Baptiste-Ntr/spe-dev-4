const API_URL = 'http://localhost:8000/api';

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Important: Ne pas définir Content-Type pour les requêtes avec FormData
  if (options.body instanceof FormData) {
    // Supprimer le Content-Type pour laisser le navigateur définir le boundary
    delete defaultHeaders['Content-Type'];
  }

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: defaultHeaders,
  };

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}
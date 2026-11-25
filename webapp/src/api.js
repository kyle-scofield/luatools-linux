const BASE = '/api';

export async function api(path, opts = {}) {
  const { method = 'GET', body } = opts;
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Error');
  const ct = res.headers.get('content-type');
  if (ct?.includes('json')) return res.json();
  return res.text();
}

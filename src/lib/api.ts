export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: { ...(options?.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || (response.status === 401 ? 'Your session has expired. Please sign in again.' : 'Something went wrong. Please try again.'))
  }
  return response.json() as Promise<T>
}

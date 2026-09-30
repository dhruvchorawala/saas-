import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // the auth token travels in an httpOnly cookie
});

/** Best human-readable message from an API error. */
export function apiError(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Cannot reach the server. Is the backend running?';
    return (err.response.data as { error?: string })?.error || fallback;
  }
  return fallback;
}

export default api;

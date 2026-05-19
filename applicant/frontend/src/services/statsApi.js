import axios from 'axios';

const ADMIN_API_BASE = import.meta.env.VITE_ADMIN_API_BASE || 'http://localhost:9000';

const statsApi = axios.create({
  baseURL: `${ADMIN_API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export const getStats = async () => {
  const response = await statsApi.get('/stats');
  return response.data;
};

export default { getStats };

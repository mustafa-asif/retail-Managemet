import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({ baseURL: `${API_BASE_URL}/audit` });

export const getAuditLogs = async (params?: Record<string, any>) => (await api.get('', { params })).data;

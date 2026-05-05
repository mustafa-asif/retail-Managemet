import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({ baseURL: `${API_BASE_URL}/sales` });

export const getSales = async (params?: Record<string, any>) => (await api.get('', { params })).data;
export const getSaleDetails = async (id: number | string) => (await api.get(`/${id}`)).data;
export const processSale = async (data: any) => (await api.post('/process', data)).data;

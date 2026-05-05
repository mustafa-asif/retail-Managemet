import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({ baseURL: `${API_BASE_URL}/inventory` });

export const getInventory = async () => (await api.get('')).data;
export const updateInventory = async (id: number | string, data: { quantity: number }) => (await api.put(`/${id}`, data)).data;
export const refreshMV = async () => (await api.post('/refresh-mv')).data;

import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({ baseURL: `${API_BASE_URL}/stores` });

export const getStores = async () => (await api.get('')).data;
export const getStore = async (id: number | string) => (await api.get(`/${id}`)).data;
export const createStore = async (data: any) => (await api.post('', data)).data;
export const updateStore = async (id: number | string, data: any) => (await api.put(`/${id}`, data)).data;
export const deleteStore = async (id: number | string) => (await api.delete(`/${id}`)).data;

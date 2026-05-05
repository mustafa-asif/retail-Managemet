import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({ baseURL: `${API_BASE_URL}/products` });

export const getProducts = async () => (await api.get('')).data;
export const getProduct = async (id: number | string) => (await api.get(`/${id}`)).data;
export const createProduct = async (data: any) => (await api.post('', data)).data;
export const updateProduct = async (id: number | string, data: any) => (await api.put(`/${id}`, data)).data;
export const deleteProduct = async (id: number | string) => (await api.delete(`/${id}`)).data;

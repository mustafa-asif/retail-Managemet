import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({ baseURL: `${API_BASE_URL}/customers` });

export const getCustomers = async () => (await api.get('')).data;
export const getCustomer = async (id: number | string) => (await api.get(`/${id}`)).data;
export const createCustomer = async (data: any) => (await api.post('', data)).data;
export const updateCustomer = async (id: number | string, data: any) => (await api.put(`/${id}`, data)).data;
export const deleteCustomer = async (id: number | string) => (await api.delete(`/${id}`)).data;

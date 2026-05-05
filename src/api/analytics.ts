import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({ baseURL: `${API_BASE_URL}/analytics` });

export const getDashboardAnalytics = async () => (await api.get('/dashboard')).data;
export const getMonthlySales = async () => (await api.get('/monthly-sales')).data;
export const getStoreSummary = async () => (await api.get('/store-summary')).data;
export const getBestSellingProducts = async () => (await api.get('/best-selling')).data;

export const getProductSets = async (type: string) => (await api.get(`/product-sets`, { params: { type } })).data;

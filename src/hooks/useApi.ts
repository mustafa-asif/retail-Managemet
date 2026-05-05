import { useState, useCallback } from 'react';

export function useApi(apiFunc: (...args: any[]) => Promise<any>, immediate = false) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<any>(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, execute, setData };
}

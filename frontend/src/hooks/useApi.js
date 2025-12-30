// frontend/src/hooks/useApi.js

import { useCallback, useState } from "react";

export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(...args);

        if (response.success) {
          setData(response.data);
          return { success: true, data: response.data };
        } else {
          setError(response.message || "Error en la operación");
          return { success: false, message: response.message };
        }
      } catch (err) {
        const errorMessage = err.message || "Error de conexión";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

// frontend/src/hooks/useTable.js

import { useEffect, useState } from "react";

export const useTable = (fetchFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction({
        ...params,
        page: pagination.currentPage,
        per_page: pagination.perPage,
      });

      if (response.success) {
        // Si la respuesta tiene paginación
        if (response.data.data) {
          setData(response.data.data);
          setPagination({
            currentPage: response.data.current_page || 1,
            perPage: response.data.per_page || 15,
            total: response.data.total || 0,
            lastPage: response.data.last_page || 1,
          });
        } else {
          // Si es un array simple
          setData(response.data);
        }
      } else {
        setError(response.message || "Error al cargar datos");
      }
    } catch (err) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params, pagination.currentPage]);

  const setPage = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const setSearch = (searchTerm) => {
    setParams((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const setFilters = (filters) => {
    setParams((prev) => ({ ...prev, ...filters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    pagination,
    setPage,
    setSearch,
    setFilters,
    refresh,
  };
};

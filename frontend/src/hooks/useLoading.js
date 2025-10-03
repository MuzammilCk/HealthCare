import { useState, useEffect } from 'react';

// Custom hook for managing loading states with skeleton animations
export const useLoading = (initialState = true) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const startLoading = () => {
    setLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const setErrorState = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const reset = () => {
    setLoading(initialState);
    setError(null);
  };

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    reset
  };
};

// Hook for async operations with loading states
export const useAsyncLoading = (asyncFunction, dependencies = []) => {
  const { loading, error, startLoading, stopLoading, setErrorState } = useLoading();

  const execute = async (...args) => {
    try {
      startLoading();
      const result = await asyncFunction(...args);
      stopLoading();
      return result;
    } catch (err) {
      setErrorState(err.message || 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    if (asyncFunction && dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  return {
    loading,
    error,
    execute
  };
};

// Hook for page loading with skeleton
export const usePageLoading = (fetchFunction, dependencies = []) => {
  const { loading, error, startLoading, stopLoading, setErrorState } = useLoading(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        startLoading();
        await fetchFunction();
        stopLoading();
      } catch (err) {
        setErrorState(err.message || 'Failed to load data');
      }
    };

    loadData();
  }, dependencies);

  return {
    loading,
    error,
    retry: () => {
      const loadData = async () => {
        try {
          startLoading();
          await fetchFunction();
          stopLoading();
        } catch (err) {
          setErrorState(err.message || 'Failed to load data');
        }
      };
      loadData();
    }
  };
};

// Hook for form submission loading
export const useFormLoading = () => {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (submitFunction) => {
    try {
      setSubmitting(true);
      await submitFunction();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (uploadFunction) => {
    try {
      setUploading(true);
      await uploadFunction();
    } finally {
      setUploading(false);
    }
  };

  return {
    submitting,
    uploading,
    handleSubmit,
    handleUpload
  };
};

// Hook for data fetching with loading states
export const useDataLoading = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const { loading, error, startLoading, stopLoading, setErrorState } = useLoading(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        startLoading();
        const result = await fetchFunction();
        setData(result);
        stopLoading();
      } catch (err) {
        setErrorState(err.message || 'Failed to load data');
      }
    };

    loadData();
  }, dependencies);

  const refetch = async () => {
    try {
      startLoading();
      const result = await fetchFunction();
      setData(result);
      stopLoading();
    } catch (err) {
      setErrorState(err.message || 'Failed to load data');
    }
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

export default useLoading;

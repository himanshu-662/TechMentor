import apiClient from './api';

export const splitService = {
  getSummary: async (datasetId) => {
    try {
      const response = await apiClient.get(`/datasets/${datasetId}/split/summary`);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fetch split summary'
      };
    }
  },

  executeSplit: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/split`, config);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to execute train-test split'
      };
    }
  }
};

export default splitService;

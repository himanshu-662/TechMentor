import apiClient from './api';

export const encodingService = {
  getSummary: async (datasetId) => {
    try {
      const response = await apiClient.get(`/datasets/${datasetId}/encoding`);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fetch encoding summary'
      };
    }
  },

  previewEncoding: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/encoding/preview`, config);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to preview encoding'
      };
    }
  },

  applyEncoding: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/encoding/apply`, {
        ...config,
        confirmed: true
      });
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to apply encoding'
      };
    }
  }
};

export default encodingService;

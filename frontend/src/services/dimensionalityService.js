import apiClient from './api';

export const dimensionalityService = {
  getSummary: async (datasetId) => {
    try {
      const response = await apiClient.get(`/datasets/${datasetId}/dimensionality/summary`);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fetch dimensionality summary'
      };
    }
  },

  previewDimensionality: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/dimensionality/preview`, config);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to preview dimensionality reduction'
      };
    }
  },

  applyDimensionality: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/dimensionality/apply`, {
        ...config,
        confirmed: true
      });
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to apply dimensionality reduction'
      };
    }
  }
};

export default dimensionalityService;

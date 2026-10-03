import apiClient from './api';

export const featureSelectionService = {
  getSummary: async (datasetId) => {
    try {
      const response = await apiClient.get(`/datasets/${datasetId}/feature-selection/summary`);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fetch feature selection summary'
      };
    }
  },

  previewFeatureSelection: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/feature-selection/preview`, config);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to preview feature selection'
      };
    }
  },

  applyFeatureSelection: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/feature-selection/apply`, {
        ...config,
        confirmed: true
      });
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to apply feature selection'
      };
    }
  }
};

export default featureSelectionService;

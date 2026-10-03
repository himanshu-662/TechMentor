import apiClient from './api';

export const getFeatureOpportunities = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/feature-engineering/opportunities`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch feature opportunities.'
    };
  }
};

export const getFeatureHistory = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/feature-engineering/history`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch feature history.'
    };
  }
};

export const previewFeatureEngineering = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/feature-engineering/preview`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to preview engineered feature.'
    };
  }
};

export const applyFeatureEngineering = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/feature-engineering/apply`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to apply feature engineering.'
    };
  }
};

export const undoFeatureEngineering = async (datasetId) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/feature-engineering/undo`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to undo feature engineering operation.'
    };
  }
};

export default {
  getFeatureOpportunities,
  getFeatureHistory,
  previewFeatureEngineering,
  applyFeatureEngineering,
  undoFeatureEngineering
};

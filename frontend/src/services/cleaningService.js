import apiClient from './api';

/**
 * Service for Phase 5: Automated Data Cleaning & Versioning Engine
 */

export const getRecommendations = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/cleaning/recommendations`);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to fetch cleaning recommendations.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string'
        ? err.response.data.detail
        : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const previewCleaning = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/cleaning/preview`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to preview cleaning transformation.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string'
        ? err.response.data.detail
        : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const applyCleaning = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/cleaning/apply`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to apply cleaning transformation.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string'
        ? err.response.data.detail
        : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const getHistory = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/cleaning/history`);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to fetch cleaning history.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string'
        ? err.response.data.detail
        : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const undoOperation = async (datasetId) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/cleaning/undo`);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to undo cleaning operation.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string'
        ? err.response.data.detail
        : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export default {
  getRecommendations,
  previewCleaning,
  applyCleaning,
  getHistory,
  undoOperation,
};

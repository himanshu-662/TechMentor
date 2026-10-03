import apiClient from './api';

export const getTransformationSummary = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/transformations`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch transformation summary.'
    };
  }
};

export const getColumnTransformationDetail = async (datasetId, column) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/transformations/${encodeURIComponent(column)}`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch column transformation details.'
    };
  }
};

export const previewTransformation = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/transformations/preview`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to generate transformation preview.'
    };
  }
};

export const applyTransformation = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/transformations/apply`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to apply transformation.'
    };
  }
};

export const getTransformationHistory = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/transformations/history`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch transformation history.'
    };
  }
};

export const undoTransformation = async (datasetId) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/transformations/undo`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to undo transformation operation.'
    };
  }
};

export default {
  getTransformationSummary,
  getColumnTransformationDetail,
  previewTransformation,
  applyTransformation,
  getTransformationHistory,
  undoTransformation
};

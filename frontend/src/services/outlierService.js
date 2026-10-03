import apiClient from './api';

export const getDatasetOutlierSummary = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/outliers`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch outlier summary.'
    };
  }
};

export const getColumnOutlierDetail = async (datasetId, column, method = null, multiplier = null, threshold = null) => {
  try {
    const params = {};
    if (method) params.method = method;
    if (multiplier !== null && multiplier !== undefined) params.multiplier = multiplier;
    if (threshold !== null && threshold !== undefined) params.threshold = threshold;

    const response = await apiClient.get(`/datasets/${datasetId}/outliers/${encodeURIComponent(column)}`, { params });
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch column outlier details.'
    };
  }
};

export const previewOutlierTreatment = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/outliers/preview`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to generate outlier preview.'
    };
  }
};

export const applyOutlierTreatment = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/outliers/apply`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to apply outlier treatment.'
    };
  }
};

export const getOutlierHistory = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/outliers/history`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch outlier history.'
    };
  }
};

export default {
  getDatasetOutlierSummary,
  getColumnOutlierDetail,
  previewOutlierTreatment,
  applyOutlierTreatment,
  getOutlierHistory
};

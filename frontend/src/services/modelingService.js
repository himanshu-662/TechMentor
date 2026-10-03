import apiClient from './api';

export const modelingService = {
  getSummary: async (datasetId) => {
    try {
      const response = await apiClient.get(`/datasets/${datasetId}/modeling/summary`);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fetch modeling summary'
      };
    }
  },

  fitModel: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/modeling/fit`, config);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fit model'
      };
    }
  },

  predict: async (datasetId, config = {}) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/modeling/predict`, config);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to generate predictions'
      };
    }
  },

  predictSingle: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/modeling/predict-single`, config);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to generate single prediction'
      };
    }
  },

  getOriginalSchema: async (datasetId, modelId = null) => {
    try {
      const params = modelId ? { model_id: modelId } : {};
      const response = await apiClient.get(`/datasets/${datasetId}/modeling/original-schema`, { params });
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fetch original dataset schema'
      };
    }
  },

  predictLive: async (datasetId, config) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/modeling/predict-live`, config);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to execute live prediction'
      };
    }
  },

  getSampleInstance: async (datasetId, modelId = null) => {
    try {
      const params = modelId ? { model_id: modelId } : {};
      const response = await apiClient.get(`/datasets/${datasetId}/modeling/sample-instance`, { params });
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fetch sample instance'
      };
    }
  },

  evaluate: async (datasetId) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/modeling/evaluate`, {});
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to evaluate model'
      };
    }
  },

  listModels: async (datasetId) => {
    try {
      const response = await apiClient.get(`/datasets/${datasetId}/modeling/models`);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to list fitted models'
      };
    }
  },

  activateModel: async (datasetId, modelId) => {
    try {
      const response = await apiClient.post(`/datasets/${datasetId}/modeling/models/${modelId}/activate`);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to activate model'
      };
    }
  },

  getModelDownloadUrl: (datasetId, modelId = null) => {
    const baseUrl = apiClient.defaults.baseURL || '/api/v1';
    if (modelId) {
      return `${baseUrl}/datasets/${datasetId}/modeling/models/${modelId}/download`;
    }
    return `${baseUrl}/datasets/${datasetId}/modeling/download`;
  },

  downloadModel: async (datasetId, modelId = null) => {
    try {
      const url = modelId
        ? `/datasets/${datasetId}/modeling/models/${modelId}/download`
        : `/datasets/${datasetId}/modeling/download`;

      const response = await apiClient.get(url, {
        responseType: 'blob'
      });

      let filename = modelId ? `datamentor_model_${modelId}.pkl` : `datamentor_model.pkl`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      return { success: true, filename, error: null };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || err.message || 'Failed to download serialized model pickle file'
      };
    }
  },

  predictBatchRecords: async (datasetId, records, modelId = null) => {
    try {
      const payload = {
        records,
        model_id: modelId
      };
      const response = await apiClient.post(`/datasets/${datasetId}/modeling/predict-batch`, payload);
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to generate batch predictions on records'
      };
    }
  },

  predictBatchFile: async (datasetId, file, modelId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (modelId) {
        formData.append('model_id', modelId);
      }
      const response = await apiClient.post(`/datasets/${datasetId}/modeling/predict-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to predict on uploaded dataset file'
      };
    }
  },

  getPredictTemplate: async (datasetId, modelId = null) => {
    try {
      const params = modelId ? { model_id: modelId } : {};
      const response = await apiClient.get(`/datasets/${datasetId}/modeling/predict-template`, { params });
      return { data: response.data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err.response?.data?.detail || err.message || 'Failed to fetch prediction template'
      };
    }
  },

  downloadPredictionsCsv: async (datasetId) => {
    try {
      const response = await apiClient.get(`/datasets/${datasetId}/modeling/download-predictions`, {
        responseType: 'blob'
      });
      let filename = `predictions_${datasetId}.csv`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      return { success: true, filename, error: null };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || err.message || 'Failed to download enriched predictions CSV'
      };
    }
  }
};

export default modelingService;


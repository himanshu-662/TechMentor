import apiClient from './api';

const ALLOWED_EXTENSIONS = ['csv', 'xlsx', 'xls'];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Validate a file client-side before initiating upload.
 * Returns null if valid, or an error string if invalid.
 */
export const validateFileClientSide = (file) => {
  if (!file) {
    return 'Please select a dataset file.';
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return `Unsupported file format ".${extension || 'unknown'}". Supported formats: ${ALLOWED_EXTENSIONS.map(e => '.' + e).join(', ')}`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File size exceeds the 50 MB limit. Please select a smaller dataset.';
  }

  if (file.size === 0) {
    return 'The selected file is empty (0 bytes).';
  }

  return null;
};

/**
 * Upload a raw dataset file to the backend with progress tracking.
 *
 * @param {File} file - File object from input or drag-and-drop
 * @param {Function} onProgress - Progress callback receiving percentage (0-100)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const uploadDataset = async (file, onProgress) => {
  const validationError = validateFileClientSide(file);
  if (validationError) {
    return { data: null, error: validationError };
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for uploads
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to upload dataset.';

    if (err.response?.data?.detail) {
      if (typeof err.response.data.detail === 'string') {
        errorMessage = err.response.data.detail;
      } else if (Array.isArray(err.response.data.detail)) {
        errorMessage = err.response.data.detail.map((e) => e.msg || e).join(', ');
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    return { data: null, error: errorMessage };
  }
};

export const getDatasetProfile = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}/profile`);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to fetch dataset profile.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string' ? err.response.data.detail : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const previewCleaning = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/clean/preview`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to preview cleaning transformation.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string' ? err.response.data.detail : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const applyCleaning = async (datasetId, payload) => {
  try {
    const response = await apiClient.post(`/datasets/${datasetId}/clean/apply`, payload);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to apply cleaning transformation.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string' ? err.response.data.detail : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const listDatasets = async () => {
  try {
    const response = await apiClient.get('/datasets');
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to load dataset history.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string' ? err.response.data.detail : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const getDatasetById = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}`);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to retrieve dataset.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string' ? err.response.data.detail : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const deleteDataset = async (datasetId) => {
  try {
    const response = await apiClient.delete(`/datasets/${datasetId}`);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to delete dataset.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string' ? err.response.data.detail : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};

export const clearAllDatasets = async () => {
  try {
    const response = await apiClient.delete('/datasets');
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Failed to clear all datasets.';
    if (err.response?.data?.detail) {
      errorMessage = typeof err.response.data.detail === 'string' ? err.response.data.detail : err.response.data.detail.map((e) => e.msg || e).join(', ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    return { data: null, error: errorMessage };
  }
};


export default {
  uploadDataset,
  listDatasets,
  getDatasetById,
  deleteDataset,
  clearAllDatasets,
  getDatasetProfile,
  previewCleaning,
  applyCleaning,
  validateFileClientSide,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
};


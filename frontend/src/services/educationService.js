import apiClient from './api';

/**
 * Education API client for fetching concepts and contextual explanations.
 */

export const getConcepts = async ({ category, search } = {}) => {
  try {
    const params = {};
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;

    const response = await apiClient.get('/education/concepts', { params });
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to load educational concepts.'
    };
  }
};

export const getConcept = async (conceptId) => {
  try {
    const response = await apiClient.get(`/education/concepts/${encodeURIComponent(conceptId)}`);
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || `Failed to fetch concept '${conceptId}'.`
    };
  }
};

export const explainConcept = async ({ concept_id, dataset_id, column, level = 'beginner' }) => {
  try {
    const response = await apiClient.post('/education/explain', {
      concept_id,
      dataset_id: dataset_id || null,
      column: column || null,
      level: level || 'beginner'
    });
    return { data: response.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to generate contextual explanation.'
    };
  }
};

export default {
  getConcepts,
  getConcept,
  explainConcept,
};

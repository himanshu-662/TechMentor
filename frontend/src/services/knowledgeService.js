import api from './api';

export const knowledgeService = {
  /**
   * List all knowledge documents with optional category and status filters.
   */
  listDocuments: async (params = {}) => {
    const response = await api.get('/knowledge/documents', { params });
    return response.data;
  },

  /**
   * Upload a new document file.
   */
  uploadDocument: async (formData) => {
    const response = await api.post('/knowledge/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload raw text document.
   */
  uploadTextDocument: async (payload) => {
    const response = await api.post('/knowledge/documents/text', payload);
    return response.data;
  },

  /**
   * Get single document metadata and chunks.
   */
  getDocumentDetails: async (documentId) => {
    const response = await api.get(`/knowledge/documents/${documentId}`);
    return response.data;
  },

  /**
   * Get chunks for a document.
   */
  getDocumentChunks: async (documentId) => {
    const response = await api.get(`/knowledge/documents/${documentId}/chunks`);
    return response.data;
  },

  /**
   * Re-index a document.
   */
  reindexDocument: async (documentId) => {
    const response = await api.post(`/knowledge/documents/${documentId}/reindex`);
    return response.data;
  },

  /**
   * Activate document.
   */
  activateDocument: async (documentId) => {
    const response = await api.post(`/knowledge/documents/${documentId}/activate`);
    return response.data;
  },

  /**
   * Archive document.
   */
  archiveDocument: async (documentId) => {
    const response = await api.post(`/knowledge/documents/${documentId}/archive`);
    return response.data;
  },

  /**
   * Delete document.
   */
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/knowledge/documents/${documentId}`);
    return response.data;
  },

  /**
   * Search knowledge base.
   */
  searchKnowledge: async (searchPayload) => {
    const response = await api.post('/knowledge/search', searchPayload);
    return response.data;
  },

  /**
   * Run retrieval benchmark suite.
   */
  runBenchmark: async (params = { k: 5, method: 'hybrid' }) => {
    const response = await api.get('/knowledge/benchmark', { params });
    return response.data;
  },

  /**
   * Get knowledge base stats.
   */
  getStats: async () => {
    const response = await api.get('/knowledge/stats');
    return response.data;
  }
};

export default knowledgeService;

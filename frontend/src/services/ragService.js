import api from './api';

export const ragService = {
  /**
   * Ask the AI Mentor a question with grounded RAG retrieval and optional dataset context.
   */
  askMentor: async (payload) => {
    const response = await api.post('/rag/ask', payload);
    return response.data;
  },

  /**
   * Search knowledge base using RAG retrieval engine.
   */
  searchRag: async (payload) => {
    const response = await api.post('/rag/search', payload);
    return response.data;
  },

  /**
   * Get RAG system health, embedding provider, and index stats.
   */
  getRagStatus: async () => {
    const response = await api.get('/rag/status');
    return response.data;
  }
};

export default ragService;

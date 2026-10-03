import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  MessageSquareCode,
  FileText,
  Search,
  Award,
  Sparkles,
  Send,
  RefreshCw,
  Sliders,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useWorkflow } from '../state/WorkflowContext';
import knowledgeService from '../services/knowledgeService';
import ragService from '../services/ragService';
import KnowledgeDocumentList from '../components/rag/KnowledgeDocumentList';
import KnowledgeUpload from '../components/rag/KnowledgeUpload';
import KnowledgeSearch from '../components/rag/KnowledgeSearch';
import RAGBenchmarkDashboard from '../components/rag/RAGBenchmarkDashboard';
import SourceList from '../components/rag/SourceList';
import StructuredRAGResponse from '../components/rag/StructuredRAGResponse';

export const KnowledgeBase = () => {
  const { activeDataset } = useWorkflow();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'documents' | 'search' | 'benchmark'
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am Menti.ai, your Pedagogical AI Tutor powered by LangChain and Google Gemini. Ask me any conceptual question about Python, Statistics, Preprocessing, Machine Learning, or your active dataset!",
      sources: [],
      queryType: 'GENERAL_KNOWLEDGE',
      structuredOutput: {
        summary: "I am Menti.ai, your Grounded Tutor in the curated machine learning curriculum. Ask me about algorithms, feature engineering, evaluation metrics, or your dataset pipeline!",
        key_concepts: [
          "Dual Vector + BM25 Hybrid Retrieval with Reciprocal Rank Fusion (RRF)",
          "Source-grounded explanations with verified citations",
          "Interactive follow-up questions and executable code examples"
        ],
        follow_up_questions: [
          "What is the difference between Precision and Recall?",
          "Why is StandardScaler sensitive to outliers?",
          "How does Principal Component Analysis reduce dimensions?"
        ]
      },
      followUpQuestions: [
        "What is the difference between Precision and Recall?",
        "Why is StandardScaler sensitive to outliers?",
        "How does Principal Component Analysis reduce dimensions?"
      ]
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [includeDatasetContext, setIncludeDatasetContext] = useState(Boolean(activeDataset));
  const chatBottomRef = useRef(null);

  // Load documents and stats
  const fetchKnowledgeData = async () => {
    setLoadingDocs(true);
    try {
      const data = await knowledgeService.listDocuments();
      setDocuments(data.documents || []);
      const statsData = await knowledgeService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load knowledge data', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const executeAskQuestion = async (userText) => {
    if (!userText || !userText.trim() || isAsking) return;

    const newMessages = [
      ...chatMessages,
      { role: 'user', content: userText }
    ];
    setChatMessages(newMessages);
    setIsAsking(true);

    try {
      const payload = {
        question: userText,
        dataset_id: includeDatasetContext && activeDataset ? activeDataset.dataset_id : undefined,
        top_k: 4
      };

      const response = await ragService.askMentor(payload);

      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources || [],
          queryType: response.query_type || 'GENERAL_KNOWLEDGE',
          structuredOutput: response.structured_output,
          followUpQuestions: response.follow_up_questions || [],
          predictionResult: response.prediction_result,
          contextUsed: response.context_used,
          latencyMs: response.latency_ms
        }
      ]);
    } catch (err) {
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            "I encountered an issue retrieving information from the knowledge base. Please check backend connectivity or try rephrasing your query.",
          sources: [],
          queryType: 'GENERAL_KNOWLEDGE',
          isError: true
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const q = inputQuestion.trim();
    if (!q || isAsking) return;
    setInputQuestion('');
    await executeAskQuestion(q);
  };

  const handleSelectQuestion = (qText) => {
    setInputQuestion(qText);
    executeAskQuestion(qText);
  };

  const sampleQuestions = [
    'Predict for Age=25, Fare=50, Pclass=1',
    'What is overfitting and how do I prevent it?',
    'What is the difference between Precision and Recall?',
    'Why is StandardScaler sensitive to outliers?',
    'How does Principal Component Analysis reduce dimensions?'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">AI Mentor</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                Interactive Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Source-grounded AI mentor connected to versioned educational curriculum & hybrid retrieval
            </p>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>AI Tutor Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'documents'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents ({documents.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Retrieval Inspector</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'benchmark'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Benchmark</span>
          </button>
        </div>
      </div>

      {/* Tab 1: AI Tutor Chat */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Stream (3 Cols) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[72vh] shadow-2xl overflow-hidden">
            {/* Chat Header Bar */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-white">Grounded Pedagogical Assistant</span>
              </div>

              {/* Dataset Context Toggle */}
              {activeDataset && (
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={includeDatasetContext}
                    onChange={(e) => setIncludeDatasetContext(e.target.checked)}
                    className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <Database className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-[11px] font-medium">
                    Include active dataset context ({activeDataset.filename})
                  </span>
                </label>
              )}
            </div>

            {/* Message History List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 font-sans">
              {chatMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in duration-150`}
                  >
                    {/* Routing Type Tag */}
                    {!isUser && msg.queryType && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pl-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-purple-500/30 text-purple-300 font-bold uppercase">
                          {msg.queryType}
                        </span>
                        {msg.latencyMs && <span>{msg.latencyMs.toFixed(0)} ms</span>}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-purple-600 text-white rounded-br-sm shadow-md font-medium'
                          : 'bg-slate-950/90 border border-slate-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap font-sans text-[12px]">{msg.content}</div>
                      ) : (
                        <StructuredRAGResponse
                          content={msg.content}
                          structuredOutput={msg.structuredOutput}
                          followUpQuestions={msg.followUpQuestions}
                          sources={msg.sources}
                          predictionResult={msg.predictionResult}
                          onSelectQuestion={handleSelectQuestion}
                          isError={msg.isError}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {isAsking && (
                <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse p-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Retrieving knowledge and synthesizing grounded answer with Gemini...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Preset Question Pills */}
            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0">Ask:</span>
              {sampleQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuestion(q)}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-purple-300 transition-colors shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask a conceptual machine learning question..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isAsking || !inputQuestion.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-40 text-white font-semibold rounded-xl text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Right Sidebar: Knowledge Base Info (1 Col) */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Strict Grounding Policy</span>
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                The Menti.ai tutor operates under a <strong className="text-white">"retrieve first, generate second"</strong> rule.
                It verifies factual claims against indexed documentation and will decline answering if no verified source exists.
              </p>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono">
                Fallback Notice:
                <div className="italic text-purple-300 mt-0.5">
                  "I couldn't find enough relevant information in the knowledge base to answer this reliably."
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Indexed Curriculum</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                {stats?.categories?.slice(0, 6).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>{cat}</span>
                    <span className="font-mono text-purple-400 text-[10px]">
                      {documents.filter((d) => d.category === cat).length} docs
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className="w-full text-center text-[11px] text-purple-400 hover:text-purple-300 font-medium pt-2 border-t border-slate-800/80"
              >
                Manage All Knowledge Documents →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Knowledge Documents */}
      {activeTab === 'documents' && (
        <KnowledgeDocumentList
          documents={documents}
          stats={stats}
          isLoading={loadingDocs}
          onRefresh={fetchKnowledgeData}
          onOpenUpload={() => setIsUploadOpen(true)}
        />
      )}

      {/* Tab 3: Retrieval Inspector */}
      {activeTab === 'search' && <KnowledgeSearch />}

      {/* Tab 4: Benchmark */}
      {activeTab === 'benchmark' && <RAGBenchmarkDashboard />}

      {/* Upload Modal */}
      <KnowledgeUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchKnowledgeData}
      />
    </div>
  );
};

export default KnowledgeBase;

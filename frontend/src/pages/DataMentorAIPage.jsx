import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Search,
  Trash2,
  Edit2,
  Pin,
  Bot,
  User,
  Database,
  Layers,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Award,
  Zap,
  Sliders,
  Code2,
  RefreshCw,
  Download,
  Home,
  X,
  MessageSquareCode,
  ShieldCheck,
  Brain,
  Square
} from 'lucide-react';
import { useWorkflow, WORKFLOW_STEPS } from '../state/WorkflowContext';
import ragService from '../services/ragService';
import knowledgeService from '../services/knowledgeService';
import StructuredRAGResponse from '../components/rag/StructuredRAGResponse';
import KnowledgeDocumentList from '../components/rag/KnowledgeDocumentList';
import KnowledgeUpload from '../components/rag/KnowledgeUpload';
import KnowledgeSearch from '../components/rag/KnowledgeSearch';
import RAGBenchmarkDashboard from '../components/rag/RAGBenchmarkDashboard';

// Curated high-value prompts categorized for the welcome grid
const SAMPLE_PROMPTS = [
  {
    category: 'Live Predictions',
    query: 'Predict for Age=25, Fare=50, Pclass=1',
    desc: 'Run Step 12 inference against the trained model'
  },
  {
    category: 'Core Theory',
    query: 'Why is StandardScaler sensitive to outliers? Show formula',
    desc: 'Mathematical derivation of sample moments'
  },
  {
    category: 'Feature Engineering',
    query: 'When should I use One-Hot vs Target Encoding?',
    desc: 'Cardinality trade-offs & data leakage prevention'
  },
  {
    category: 'Evaluation & Metrics',
    query: 'Why is PR-AUC better than ROC-AUC for imbalanced datasets?',
    desc: 'Precision-Recall focus vs True Negative inflation'
  }
];

// Available Mentor Modes
const MENTOR_MODES = [
  {
    id: 'tutor',
    name: 'Menti.ai Tutor',
    shortName: 'Tutor',
    tag: 'Grounded RAG',
    desc: 'Pedagogical ML curriculum and active dataset grounding',
    icon: Sparkles
  },
  {
    id: 'predict',
    name: 'Live Prediction Engine',
    shortName: 'Prediction',
    tag: 'Step 12 Inference',
    desc: 'Live model evaluation & class probability scoring',
    icon: Zap
  },
  {
    id: 'math',
    name: 'Math & Formulas Prover',
    shortName: 'Math',
    tag: 'Derivations',
    desc: 'Exact statistical formulas and step-by-step arithmetic',
    icon: Sliders
  },
  {
    id: 'code',
    name: 'Scikit-Learn Code Generator',
    shortName: 'Code',
    tag: 'Python',
    desc: 'Production-ready leak-free machine learning pipelines',
    icon: Code2
  }
];

const INITIAL_CONVERSATION = {
  id: 'conv-default',
  title: 'Welcome to Menti.ai',
  createdAt: new Date().toISOString(),
  pinned: false,
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        "Hello! I am **Menti**, your pedagogical AI Mentor by TechMentor. I provide direct, source-grounded answers for algorithms, mathematics, feature engineering, and live predictions on your loaded dataset.\n\nHow can I help you today?",
      queryType: 'GENERAL_KNOWLEDGE',
      sources: []
    }
  ]
};

export const DataMentorAIPage = () => {
  const { currentStepId, goToStep, activeDataset } = useWorkflow();

  // Conversations State
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('datamentor_ai_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved conversations', e);
    }
    return [INITIAL_CONVERSATION];
  });

  const [activeConvId, setActiveConvId] = useState(() => {
    return conversations[0]?.id || 'conv-default';
  });

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [selectedMode, setSelectedMode] = useState(MENTOR_MODES[0]);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [includeDatasetContext, setIncludeDatasetContext] = useState(Boolean(activeDataset));
  const [selectedStepContext, setSelectedStepContext] = useState('all');
  const [renamingConvId, setRenamingConvId] = useState(null);
  const [renamingTitle, setRenamingTitle] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals for Knowledge Base, Search, and Benchmark
  const [activeModal, setActiveModal] = useState(null); // 'documents' | 'upload' | 'search' | 'benchmark' | null
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // References
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const modeDropdownRef = useRef(null);
  const abortStreamingRef = useRef(false);
  const activeStreamingIdRef = useRef(null);

  // Show quick toast notification
  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Switch Mentor Mode safely
  const handleSelectMode = (mode, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedMode(mode);
    setIsModeDropdownOpen(false);
    showToast(`Mode: ${mode.name}`);
  };

  // Close mode dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target)) {
        setIsModeDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModeDropdownOpen(false);
      }
    };

    if (isModeDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModeDropdownOpen]);

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('datamentor_ai_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to persist conversations', e);
    }
  }, [conversations]);

  // Sync active dataset flag
  useEffect(() => {
    if (activeDataset) {
      setIncludeDatasetContext(true);
    }
  }, [activeDataset]);

  // Load knowledge docs when needed
  const fetchKnowledgeData = async () => {
    setLoadingDocs(true);
    try {
      const docsRes = await knowledgeService.listDocuments();
      setDocuments(docsRes.documents || []);
      const statsRes = await knowledgeService.getStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load knowledge data', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  // Auto-scroll when messages update
  const currentConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const messages = currentConversation ? currentConversation.messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  // Auto-focus input on change of active conversation
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConvId]);

  // Dynamic textarea height adjustment
  const handleTextareaChange = (e) => {
    setInputQuestion(e.target.value);
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  // Create a brand new chat thread
  const handleCreateNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      title: 'New Discussion',
      createdAt: new Date().toISOString(),
      pinned: false,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content:
            "Hello! I am ready to explore Machine Learning with you. Ask any conceptual question, query our indexed curriculum, or test what-if prediction scenarios!",
          queryType: 'GENERAL_KNOWLEDGE',
          sources: []
        }
      ]
    };

    setConversations([newConv, ...conversations]);
    setActiveConvId(newId);
    setInputQuestion('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
  };

  // Delete a conversation thread
  const handleDeleteConversation = (convId, e) => {
    if (e) e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== convId);
    if (updated.length === 0) {
      const defaultConv = {
        id: `conv-${Date.now()}`,
        title: 'New Discussion',
        createdAt: new Date().toISOString(),
        pinned: false,
        messages: INITIAL_CONVERSATION.messages
      };
      setConversations([defaultConv]);
      setActiveConvId(defaultConv.id);
    } else {
      setConversations(updated);
      if (activeConvId === convId) {
        setActiveConvId(updated[0].id);
      }
    }
    showToast('Conversation deleted');
  };

  // Toggle pin conversation
  const handleTogglePin = (convId, e) => {
    if (e) e.stopPropagation();
    setConversations(
      conversations.map((c) => (c.id === convId ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Start renaming a conversation
  const handleStartRename = (conv, e) => {
    if (e) e.stopPropagation();
    setRenamingConvId(conv.id);
    setRenamingTitle(conv.title);
  };

  // Save conversation rename
  const handleSaveRename = (convId, e) => {
    if (e) e.preventDefault();
    if (!renamingTitle.trim()) {
      setRenamingConvId(null);
      return;
    }
    setConversations(
      conversations.map((c) => (c.id === convId ? { ...c, title: renamingTitle.trim() } : c))
    );
    setRenamingConvId(null);
  };

  // Stop generating active response stream
  const handleStopGenerating = () => {
    abortStreamingRef.current = true;
    setIsAsking(false);
    if (activeStreamingIdRef.current) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === activeStreamingIdRef.current
                    ? { ...m, isStreaming: false }
                    : m
                )
              }
            : c
        )
      );
    }
    showToast('Generation stopped');
  };

  // Execute mentor question with smooth real-time response streaming
  const executeAskQuestion = async (userText) => {
    if (!userText || !userText.trim() || isAsking) return;

    const currentConv = conversations.find((c) => c.id === activeConvId);
    if (!currentConv) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = `asst-${Date.now()}`;
    const assistantPlaceholder = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      sources: [],
      queryType: 'GENERAL_KNOWLEDGE',
      followUpQuestions: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const isFirstUserMessage = currentConv.messages.filter((m) => m.role === 'user').length === 0;
    const newTitle = isFirstUserMessage
      ? userText.length > 28
        ? userText.slice(0, 28) + '...'
        : userText
      : currentConv.title;

    const updatedMessages = [...currentConv.messages, userMessage, assistantPlaceholder];

    // Optimistically update conversation
    setConversations(
      conversations.map((c) =>
        c.id === activeConvId
          ? { ...c, title: newTitle, messages: updatedMessages }
          : c
      )
    );

    setIsAsking(true);
    abortStreamingRef.current = false;
    activeStreamingIdRef.current = assistantMsgId;

    try {
      const payload = {
        question: userText,
        dataset_id: includeDatasetContext && activeDataset ? activeDataset.dataset_id : undefined,
        top_k: 4,
        pipeline_step: selectedStepContext !== 'all' ? selectedStepContext : undefined,
        mode: selectedMode.id
      };

      const response = await ragService.askMentor(payload);

      if (abortStreamingRef.current) {
        return;
      }

      const fullText = response.answer || '';
      // Natural, balanced reading pace (smoothly streams in ~1.0s - 1.4s)
      const chunkSize = Math.max(5, Math.ceil(fullText.length / 65));
      const stepDelay = 18; // Smooth 18ms interval

      let currentIdx = 0;
      while (currentIdx < fullText.length && !abortStreamingRef.current) {
        currentIdx = Math.min(currentIdx + chunkSize, fullText.length);
        const partial = fullText.slice(0, currentIdx);

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: partial,
                          isStreaming: currentIdx < fullText.length
                        }
                      : m
                  )
                }
              : c
          )
        );
        await new Promise((resolve) => setTimeout(resolve, stepDelay));
      }

      if (!abortStreamingRef.current) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: fullText,
                          isStreaming: false,
                          sources: response.sources || [],
                          queryType: response.query_type || 'GENERAL_KNOWLEDGE',
                          followUpQuestions: response.follow_up_questions || [],
                          predictionResult: response.prediction_result,
                          contextUsed: response.context_used,
                          latencyMs: response.latency_ms
                        }
                      : m
                  )
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('RAG request failed', err);
      const errorMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content:
          "I encountered an issue connecting to the DataMentor knowledge base. Please verify backend API status or try rephrasing your inquiry.",
        sources: [],
        queryType: 'GENERAL_KNOWLEDGE',
        isError: true,
        isStreaming: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId ? errorMessage : m
                )
              }
            : c
        )
      );
    } finally {
      setIsAsking(false);
      activeStreamingIdRef.current = null;
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const q = inputQuestion.trim();
    if (!q || isAsking) return;
    setInputQuestion('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    await executeAskQuestion(q);
  };

  const handleSelectPrompt = (promptText) => {
    setInputQuestion(promptText);
    executeAskQuestion(promptText);
  };

  const handleClearCurrentChat = () => {
    if (!currentConversation) return;
    setConversations(
      conversations.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [
                {
                  id: `msg-${Date.now()}`,
                  role: 'assistant',
                  content: "Chat cleared. What question can I help you with?",
                  queryType: 'GENERAL_KNOWLEDGE',
                  sources: []
                }
              ]
            }
          : c
      )
    );
    showToast('Chat cleared');
  };

  // Export conversation as Markdown
  const handleExportChat = () => {
    if (!currentConversation) return;
    let markdown = `# Menti.ai — ${currentConversation.title}\n`;
    markdown += `Exported from TechMentor: ${new Date().toLocaleString()}\n\n---\n\n`;

    currentConversation.messages.forEach((m) => {
      const author = m.role === 'user' ? '### User' : '### Menti.ai';
      markdown += `${author}\n\n${m.content}\n\n`;
      if (m.sources && m.sources.length > 0) {
        markdown += `**Sources:**\n`;
        m.sources.forEach((s) => {
          markdown += `- ${s.title} (${Math.round((s.similarity || 0) * 100)}% match)\n`;
        });
        markdown += `\n`;
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `menti-ai-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported as Markdown');
  };

  // Filter conversation list by search
  const filteredConversations = conversations
    .filter((c) => c.title.toLowerCase().includes(searchHistoryQuery.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased selection:bg-purple-500 selection:text-white relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-purple-500/40 text-purple-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* 1. MENTI.AI WORKSPACE SIDEBAR */}
      <aside
        className={`${
          isSidebarOpen ? 'w-72 sm:w-80 translate-x-0' : 'w-0 -translate-x-full md:w-0'
        } fixed md:relative inset-y-0 left-0 z-40 md:z-30 bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden`}
      >
        {/* Sidebar Header (Click logo/brand to navigate Home) */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div 
            onClick={() => goToStep('landing')}
            title="TechMentor - Return to Home"
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#9333EA] flex items-center justify-center text-white shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">Menti.ai</span>
              </div>
              <p className="text-[10px] text-slate-400">AI Mentor by TechMentor</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            title="Close sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* + New Chat Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] font-mono text-purple-200 bg-purple-700/50 px-1.5 py-0.5 rounded border border-purple-400/30">
              +
            </span>
          </button>
        </div>

        {/* Search Past Chats */}
        <div className="px-3 py-2 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchHistoryQuery}
              onChange={(e) => setSearchHistoryQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchHistoryQuery && (
              <button
                type="button"
                onClick={() => setSearchHistoryQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation Threads List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            const isRenaming = renamingConvId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  isActive
                    ? 'bg-purple-950/50 text-purple-200 border border-purple-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {isRenaming ? (
                  <form
                    onSubmit={(e) => handleSaveRename(conv.id, e)}
                    className="flex items-center gap-1.5 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={renamingTitle}
                      onChange={(e) => setRenamingTitle(e.target.value)}
                      autoFocus
                      onBlur={() => setRenamingConvId(null)}
                      className="w-full px-2 py-1 bg-slate-950 border border-purple-500 rounded text-xs text-white focus:outline-none"
                    />
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquareCode
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-purple-400' : 'text-slate-500'
                        }`}
                      />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    {/* Actions on Hover / Active */}
                    <div
                      className={`flex items-center gap-1 shrink-0 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity`}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(conv.id, e)}
                        title={conv.pinned ? 'Unpin' : 'Pin conversation'}
                        className={`p-1 rounded hover:bg-slate-700/60 ${
                          conv.pinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(conv, e)}
                        title="Rename title"
                        className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700/60"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        title="Delete chat"
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700/60"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Dataset Status Mini-Card */}
        {activeDataset ? (
          <div className="p-3 mx-2 my-2 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold truncate">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0"></span>
                <span className="truncate">{activeDataset.filename || 'dataset.csv'}</span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                {activeDataset.row_count ? `${activeDataset.row_count} rows` : 'Active'}
              </span>
            </div>
            <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDatasetContext}
                onChange={(e) => setIncludeDatasetContext(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-3 h-3"
              />
              <span>Ground responses with this dataset</span>
            </label>
          </div>
        ) : (
          <div className="p-2.5 mx-2 my-1 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-slate-500" />
              <span>No dataset active</span>
            </span>
            <button
              type="button"
              onClick={() => goToStep('collection')}
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Load CSV →
            </button>
          </div>
        )}

        {/* Sidebar Knowledge & Navigation Footer */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 space-y-1 shrink-0">
          <div className="grid grid-cols-3 gap-1 mb-2">
            <button
              type="button"
              onClick={() => setActiveModal('documents')}
              title="Knowledge Documents Manager"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Docs ({documents.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('search')}
              title="Retrieval Inspector"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inspector</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('benchmark')}
              title="Benchmark Accuracy"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Benchmark</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => goToStep('dashboard')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>13-Step ML Studio</span>
            </span>
            <span className="text-[10px] font-mono text-brand-400">STUDIO →</span>
          </button>

          <button
            type="button"
            onClick={() => goToStep('landing')}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Product Landing Page</span>
            </span>
            <span className="text-[9px] font-mono text-slate-500">HOME</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-14 sm:h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Expand Sidebar"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>

                <div
                  onClick={() => goToStep('landing')}
                  title="TechMentor - Return to Home"
                  className="hidden sm:flex items-center gap-2 cursor-pointer group select-none pr-3 border-r border-slate-800"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#9333EA] flex items-center justify-center text-white shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Menti.ai
                  </span>
                </div>
              </>
            )}

            {/* AI Mentor Mode Dropdown in Header */}
            <div className="relative" ref={modeDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModeDropdownOpen((prev) => !prev);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-xs font-bold text-white transition-all shadow-sm cursor-pointer select-none"
              >
                <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="tracking-tight">{selectedMode.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden sm:inline">
                  {selectedMode.tag}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Overlay */}
              {isModeDropdownOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl shadow-slate-950/90 z-[100] space-y-1 animate-in fade-in zoom-in-95"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Select AI Mentor Mode
                  </div>
                  {MENTOR_MODES.map((mode) => {
                    const isSelected = selectedMode.id === mode.id;
                    const Icon = mode.icon;
                    return (
                      <button
                        type="button"
                        key={mode.id}
                        onClick={(e) => handleSelectMode(mode, e)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/80 border border-purple-500/50 text-white'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-950 text-purple-400 mt-0.5 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{mode.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{mode.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Step Filter Context (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={selectedStepContext}
                onChange={(e) => setSelectedStepContext(e.target.value)}
                className="bg-transparent text-slate-300 text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-slate-200">
                  All Pipeline Steps
                </option>
                {WORKFLOW_STEPS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                    Step {s.stepNumber}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Chat */}
            <button
              type="button"
              onClick={handleExportChat}
              title="Export Conversation (Markdown)"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear Chat */}
            <button
              type="button"
              onClick={handleClearCurrentChat}
              title="Clear Chat"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Launch Studio CTA */}
            <button
              type="button"
              onClick={() => goToStep('collection')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-500 hover:from-brand-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Chat Stream View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 z-10">
          {/* Welcome Screen when starting fresh */}
          {messages.length <= 1 && (
            <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#9333EA] text-white shadow-xl shadow-purple-600/30 mb-1">
                  <Bot className="w-7 h-7" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  What would you like to explore today?
                </h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Ask any question about Machine Learning concepts, formulas, code, or your active dataset.
                </p>
              </div>

              {/* Sample Prompt Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectPrompt(p.query)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/40 text-left transition-all group shadow-sm flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                        {p.category}
                      </span>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-200">
                        {p.query}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              if (isUser) {
                return (
                  <div
                    key={msg.id || index}
                    className="flex items-start justify-end gap-2.5 w-full py-1 animate-in fade-in duration-150"
                  >
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 bg-[#9333EA] text-white font-medium text-xs sm:text-[13.5px] leading-relaxed whitespace-pre-wrap shadow-sm">
                      {msg.content}
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 shadow-sm shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              }

              // Assistant Message (Clean, borderless, boxless natural text)
              return (
                <div
                  key={msg.id || index}
                  className="flex items-start gap-3.5 w-full py-1 animate-in fade-in duration-150"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#9333EA] flex items-center justify-center text-white shadow-sm shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0 text-slate-100">
                    {msg.content === '' && msg.isStreaming ? (
                      <div className="flex items-center gap-2 text-xs text-purple-300 py-1.5 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400 shrink-0" />
                        <span>Menti.ai is thinking...</span>
                      </div>
                    ) : (
                      <StructuredRAGResponse
                        content={msg.content}
                        isStreaming={msg.isStreaming}
                        sources={msg.sources}
                        predictionResult={msg.predictionResult}
                        followUpQuestions={msg.followUpQuestions}
                        onSelectQuestion={handleSelectPrompt}
                        isError={msg.isError}
                      />
                    )}

                    {/* Action Toolbar on Assistant Messages (Visible when completed) */}
                    {!msg.isStreaming && msg.content && !msg.isError && (
                      <div className="flex items-center gap-2 mt-2.5 text-slate-500 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            showToast('Copied to clipboard');
                          }}
                          className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => showToast('Feedback recorded: Helpful! 👍')}
                          className="hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Feedback recorded: Needs improvement 👎')}
                          className="hover:text-rose-400 transition-colors cursor-pointer"
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => {
                            const lastUserMsg = messages
                              .filter((m) => m.role === 'user')
                              .slice(-1)[0];
                            if (lastUserMsg) executeAskQuestion(lastUserMsg.content);
                          }}
                          className="flex items-center gap-1 hover:text-purple-300 transition-colors cursor-pointer"
                          title="Regenerate"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 3. FLOATING INPUT CONTAINER */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800/80 shrink-0 z-20">
          <div className="max-w-3xl mx-auto space-y-1.5">
            <form
              onSubmit={handleSendMessage}
              className="relative flex items-center bg-slate-900 border border-slate-700 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/40 rounded-2xl p-2 shadow-xl transition-all"
            >
              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={inputQuestion}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={`Ask ${selectedMode.name.toLowerCase()} about ML concepts, formulas, code, or predictions...`}
                disabled={isAsking}
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none px-2 py-1 max-h-36 min-h-[24px]"
              />

              {/* Send or Stop Button */}
              {isAsking ? (
                <button
                  type="button"
                  onClick={handleStopGenerating}
                  className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all shrink-0 ml-1.5 cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
                  title="Stop Generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputQuestion.trim()}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all shrink-0 ml-1.5 cursor-pointer"
                  title="Send Message (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 px-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span>Mode: <strong className="text-purple-300 font-medium">{selectedMode.name}</strong></span>
              </span>
              <span>Shift + Enter for new line</span>
            </div>
          </div>
        </div>
      </main>

      {/* 4. MODALS: Knowledge Document Manager */}
      {activeModal === 'documents' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Curriculum Knowledge Documents</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <KnowledgeDocumentList
                documents={documents}
                stats={stats}
                isLoading={loadingDocs}
                onRefresh={fetchKnowledgeData}
                onOpenUpload={() => setActiveModal('upload')}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Upload Knowledge Document */}
      {activeModal === 'upload' && (
        <KnowledgeUpload
          isOpen={true}
          onClose={() => setActiveModal('documents')}
          onSuccess={() => {
            fetchKnowledgeData();
            setActiveModal('documents');
          }}
        />
      )}

      {/* MODAL: Retrieval Search Inspector */}
      {activeModal === 'search' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Hybrid Retrieval Inspector</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <KnowledgeSearch />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RAG Benchmark Dashboard */}
      {activeModal === 'benchmark' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">RAG Accuracy Benchmark</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <RAGBenchmarkDashboard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataMentorAIPage;

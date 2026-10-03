import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  X,
  Send,
  Trash2,
  Maximize2,
  Bot,
  Database,
  Loader2,
  ChevronDown,
  Layers,
  HelpCircle,
  Zap,
  ArrowRight,
  GripHorizontal,
  RotateCcw
} from 'lucide-react';
import { useWorkflow, WORKFLOW_STEPS } from '../../state/WorkflowContext';
import ragService from '../../services/ragService';
import StructuredRAGResponse from '../rag/StructuredRAGResponse';

// Context-aware questions for every step in the 13-step ML pipeline
const STEP_SUGGESTIONS = {
  collection: [
    'What makes a dataset suitable for machine learning?',
    'How do I assess dataset representative quality and data lineage?'
  ],
  loading: [
    'Why should schema types be verified during loading?',
    'What are the advantages of Parquet over CSV for large datasets?'
  ],
  eda: [
    'Why is skewness critical before applying linear models?',
    'What does Pearson vs Spearman correlation measure?'
  ],
  cleaning: [
    'When should I drop vs impute missing values?',
    'How does KNN imputation compare to median imputation?'
  ],
  outliers: [
    'Why use IQR vs Z-score for outlier detection?',
    'When should I cap (Winsorize) vs remove outliers?'
  ],
  encoding: [
    'When should I use One-Hot vs Ordinal vs Target Encoding?',
    'Why does high cardinality create issues for One-Hot Encoding?'
  ],
  scaling: [
    'Why is StandardScaler sensitive to outliers?',
    'Why must scaling parameters only be fit on training data?'
  ],
  dimensionality: [
    'How does PCA maximize explained variance?',
    'When should I choose PCA vs t-SNE for dimensionality reduction?'
  ],
  feature_selection: [
    'What is the difference between Filter, Wrapper, and Embedded selection?',
    'How does Mutual Information capture non-linear dependencies?'
  ],
  split: [
    'Why is Stratified Split essential for imbalanced classification?',
    'What is Data Leakage and how do we prevent it during train/test split?'
  ],
  fitting: [
    'How do Random Forests reduce variance compared to single Decision Trees?',
    'What is the Bias-Variance tradeoff in machine learning?'
  ],
  prediction: [
    'Predict for Age=25, Fare=50, Pclass=1',
    'What would the model predict if Fare is 100 and Pclass is 3?'
  ],
  evaluation: [
    'Why is PR-AUC better than ROC-AUC for imbalanced datasets?',
    'How do I interpret Type I vs Type II errors in a Confusion Matrix?'
  ],
  default: [
    'What are the 13 steps in the DataMentor ML lifecycle?',
    'How does DataMentor guarantee zero data leakage?'
  ]
};

export const ChatbotPopup = () => {
  const { currentStepId, goToStep, activeDataset } = useWorkflow();

  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am **Menti.ai**, your pedagogical AI Mentor by TechMentor. Ask me any conceptual question about Data Preprocessing, Machine Learning, or your active dataset!",
      sources: [],
      queryType: 'GENERAL_KNOWLEDGE',
      structuredOutput: {
        summary: "I am Menti.ai, your pedagogical AI Mentor grounded in first-principles Machine Learning and Data Engineering. Ask me about algorithms, mathematical formulas, or your current workflow step!",
        key_concepts: [
          "Dual Vector + BM25 Hybrid Retrieval with Reciprocal Rank Fusion",
          "Source-grounded explanations with verified citations",
          "Context-aware guidance for your active pipeline step"
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Draggable State & References
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const popupRef = useRef(null);
  const dragStartRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });

  // Calculate default position at bottom-right
  const getDefaultPosition = () => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };
    const width = Math.min(window.innerWidth - 32, 480);
    const height = Math.min(window.innerHeight * 0.82, 600);
    const defaultX = Math.max(16, window.innerWidth - width - 24);
    const defaultY = Math.max(16, window.innerHeight - height - 96);
    return { x: defaultX, y: defaultY };
  };

  // Reset position to bottom-right dock
  const handleResetPosition = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setPosition(getDefaultPosition());
  };

  // Initialize position when popup opens
  useEffect(() => {
    if (isOpen && !position) {
      setPosition(getDefaultPosition());
    }
  }, [isOpen]);

  // Keep within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!position || !popupRef.current) return;
      const popupWidth = popupRef.current.offsetWidth || 480;
      const popupHeight = popupRef.current.offsetHeight || 600;
      setPosition((prev) => {
        if (!prev) return null;
        return {
          x: Math.max(8, Math.min(window.innerWidth - popupWidth - 8, prev.x)),
          y: Math.max(8, Math.min(window.innerHeight - popupHeight - 8, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Handle pointer down on drag handle
  const handlePointerDown = (e) => {
    // Only primary mouse/touch button
    if (e.button !== 0) return;
    // Don't drag if clicking buttons, inputs, links
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;

    const popupEl = popupRef.current;
    const currentRect = popupEl ? popupEl.getBoundingClientRect() : { left: 0, top: 0 };
    const currX = position ? position.x : currentRect.left;
    const currY = position ? position.y : currentRect.top;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: currX,
      origY: currY
    };

    setIsDragging(true);
    e.preventDefault();
  };

  // Global Pointer Move & Up listeners while dragging
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;

      const popupEl = popupRef.current;
      const popupWidth = popupEl ? popupEl.offsetWidth : 480;
      const popupHeight = popupEl ? popupEl.offsetHeight : 600;

      const newX = Math.max(8, Math.min(window.innerWidth - popupWidth - 8, dragStartRef.current.origX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - popupHeight - 8, dragStartRef.current.origY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  // Draggable FAB (Trigger Button) State & Handlers
  const [fabPosition, setFabPosition] = useState(null);
  const [isFabDragging, setIsFabDragging] = useState(false);
  const fabRef = useRef(null);
  const fabDragStartRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });

  // Default FAB position at bottom right
  const getDefaultFabPosition = () => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };
    const defaultX = Math.max(16, window.innerWidth - 80);
    const defaultY = Math.max(16, window.innerHeight - 80);
    return { x: defaultX, y: defaultY };
  };

  // Initialize FAB position on mount
  useEffect(() => {
    if (!fabPosition && typeof window !== 'undefined') {
      setFabPosition(getDefaultFabPosition());
    }
  }, []);

  // FAB Window resize listener
  useEffect(() => {
    const handleFabResize = () => {
      if (!fabPosition || !fabRef.current) return;
      const fabWidth = fabRef.current.offsetWidth || 56;
      const fabHeight = fabRef.current.offsetHeight || 56;
      setFabPosition((prev) => {
        if (!prev) return null;
        return {
          x: Math.max(8, Math.min(window.innerWidth - fabWidth - 8, prev.x)),
          y: Math.max(8, Math.min(window.innerHeight - fabHeight - 8, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleFabResize);
    return () => window.removeEventListener('resize', handleFabResize);
  }, [fabPosition]);

  // FAB pointer down handler
  const handleFabPointerDown = (e) => {
    if (e.button !== 0) return;
    const fabEl = fabRef.current;
    const currentRect = fabEl ? fabEl.getBoundingClientRect() : { left: 0, top: 0 };
    const currX = fabPosition ? fabPosition.x : currentRect.left;
    const currY = fabPosition ? fabPosition.y : currentRect.top;

    fabDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: currX,
      origY: currY,
      hasMoved: false
    };

    setIsFabDragging(true);
  };

  // Global Pointer Move & Up for FAB
  useEffect(() => {
    if (!isFabDragging) return;

    const handlePointerMove = (e) => {
      const dx = e.clientX - fabDragStartRef.current.startX;
      const dy = e.clientY - fabDragStartRef.current.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 4) {
        fabDragStartRef.current.hasMoved = true;
      }

      const fabEl = fabRef.current;
      const fabWidth = fabEl ? fabEl.offsetWidth : 56;
      const fabHeight = fabEl ? fabEl.offsetHeight : 56;

      const newX = Math.max(8, Math.min(window.innerWidth - fabWidth - 8, fabDragStartRef.current.origX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - fabHeight - 8, fabDragStartRef.current.origY + dy));

      setFabPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsFabDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isFabDragging]);

  // FAB click trigger (ignores if dragged)
  const handleFabToggle = () => {
    if (fabDragStartRef.current.hasMoved) {
      return; // was dragging, ignore click
    }
    setIsOpen((prev) => !prev);
  };

  // Synchronize dataset context flag when active dataset changes
  useEffect(() => {
    if (activeDataset) {
      setIncludeDatasetContext(true);
    }
  }, [activeDataset]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen, isAsking]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close & custom window event triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-ai-mentor', handleToggle);
    window.addEventListener('open-ai-mentor', handleOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-ai-mentor', handleToggle);
      window.removeEventListener('open-ai-mentor', handleOpen);
    };
  }, [isOpen]);

  // Get current step metadata
  const currentStepObj = WORKFLOW_STEPS.find((s) => s.id === currentStepId);
  const currentStepName = currentStepObj ? currentStepObj.name : 'Workflow Overview';
  const currentSuggestions = STEP_SUGGESTIONS[currentStepId] || STEP_SUGGESTIONS.default;

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

  const handleClearChat = () => {
    setChatMessages([
      {
        role: 'assistant',
        content: `Chat history cleared. Currently on **${currentStepName}**. How can I help you?`,
        sources: [],
        queryType: 'GENERAL_KNOWLEDGE',
        structuredOutput: {
          summary: `Currently on ${currentStepName}. Ask me anything about this stage or machine learning concepts!`,
          key_concepts: currentSuggestions,
          follow_up_questions: currentSuggestions
        },
        followUpQuestions: currentSuggestions
      }
    ]);
  };

  const handleOpenFullPage = () => {
    setIsOpen(false);
    goToStep('chatbot');
  };

  // If already on the full-page AI Mentor screen and popup is closed, hide the FAB trigger
  if ((currentStepId === 'chatbot' || currentStepId === 'knowledge-base' || currentStepId === 'rag') && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button (FAB) - Draggable, Icon-Only */}
      <div
        ref={fabRef}
        onPointerDown={handleFabPointerDown}
        style={
          fabPosition
            ? {
                left: `${fabPosition.x}px`,
                top: `${fabPosition.y}px`,
                right: 'auto',
                bottom: 'auto'
              }
            : undefined
        }
        className={`fixed ${
          !fabPosition ? 'bottom-6 right-6' : ''
        } z-50 select-none cursor-grab active:cursor-grabbing touch-none ${
          isFabDragging ? 'scale-110 transition-none' : 'transition-transform duration-200'
        }`}
      >
        <button
          onClick={handleFabToggle}
          title={isOpen ? 'Close AI Mentor (Drag anywhere to move)' : 'Open AI Mentor Chatbot (Drag anywhere to move)'}
          aria-label={isOpen ? 'Close AI Mentor' : 'Open AI Mentor Chatbot'}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl transition-all duration-300 transform pointer-events-auto ${
            isOpen
              ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-slate-950/80 ring-2 ring-slate-600'
              : 'bg-[#9333EA] hover:bg-purple-700 shadow-purple-600/50 hover:shadow-purple-600/80 ring-4 ring-purple-500/30 hover:scale-105 active:scale-95'
          } ${isFabDragging ? 'ring-4 ring-purple-400 shadow-purple-500/80 scale-110' : ''}`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative flex items-center justify-center pointer-events-none">
              <MessageSquareCode className="w-6 h-6" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Pop-up Window */}
      {isOpen && (
        <div
          ref={popupRef}
          style={
            position
              ? {
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  right: 'auto',
                  bottom: 'auto'
                }
              : undefined
          }
          className={`fixed ${
            !position ? 'bottom-24 right-4 sm:right-6' : ''
          } w-[calc(100vw-2rem)] sm:w-[480px] h-[600px] max-h-[82vh] bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/60 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200 ${
            isDragging ? 'select-none ring-2 ring-purple-400/50 shadow-purple-500/30' : ''
          }`}
          role="dialog"
          aria-label="AI Mentor Chatbot Pop-up"
        >
          {/* Header - Drag Handle */}
          <div
            onPointerDown={handlePointerDown}
            onDoubleClick={handleResetPosition}
            title="Drag header to reposition (Double click to reset position)"
            className={`px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0 select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
              <div className="w-8 h-8 rounded-xl bg-[#9333EA] flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">Menti.ai</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 font-mono">
                    TechMentor
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                  <span className="truncate">{currentStepName}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons & Grip */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <div
                className="hidden sm:flex items-center px-1.5 py-1 text-slate-500 hover:text-slate-300 transition-colors pointer-events-none"
                title="Drag to reposition"
              >
                <GripHorizontal className="w-4 h-4" />
              </div>
              <button
                onClick={handleResetPosition}
                title="Reset Position (Dock to Bottom-Right)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleOpenFullPage}
                title="Expand to Full AI Mentor Page"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Pop-up (Esc)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Step Context Banner & Quick Suggestions */}
          <div className="px-3.5 py-2 bg-slate-950/70 border-b border-slate-800/80 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold text-purple-300">Active Step Context:</span>
                <span className="truncate text-slate-300">{currentStepObj ? currentStepObj.shortName : 'Workflow'}</span>
              </div>
              {activeDataset && (
                <div className="flex items-center gap-1 text-[10px] text-purple-300 font-mono">
                  <Database className="w-3 h-3 text-purple-400" />
                  <span className="truncate max-w-[100px]">{activeDataset.filename}</span>
                </div>
              )}
            </div>

            {/* Quick Step Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-slate-700">
              <span className="text-[10px] text-slate-500 shrink-0 font-medium">Try:</span>
              {currentSuggestions.slice(0, 2).map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuestion(sugg)}
                  className="px-2 py-0.5 rounded-md bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/25 text-purple-300 hover:text-purple-200 text-[10px] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                  <span className="truncate max-w-[180px]">{sugg}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
            {chatMessages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${isAssistant ? '' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-[#9333EA] flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                      isAssistant
                        ? 'bg-slate-950/80 border border-slate-800 text-slate-200'
                        : 'bg-[#9333EA] text-white rounded-tr-sm ml-auto'
                    }`}
                  >
                    {isAssistant ? (
                      <StructuredRAGResponse
                        content={msg.content}
                        structuredOutput={msg.structuredOutput}
                        followUpQuestions={msg.followUpQuestions}
                        sources={msg.sources}
                        predictionResult={msg.predictionResult}
                        onSelectQuestion={handleSelectQuestion}
                        isError={msg.isError}
                      />
                    ) : (
                      <p className="text-xs font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Asking Indicator */}
            {isAsking && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#9333EA] flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Consulting curriculum & generating answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask about this step, math, ML algorithms..."
                disabled={isAsking}
                className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isAsking || !inputQuestion.trim()}
                className="p-2.5 rounded-xl bg-[#9333EA] hover:bg-purple-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-500/20 transition-all shrink-0"
              >
                {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

            {/* Bottom context controls */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              {activeDataset ? (
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={includeDatasetContext}
                    onChange={(e) => setIncludeDatasetContext(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-950 w-3.5 h-3.5"
                  />
                  <span>Ground with active dataset</span>
                </label>
              ) : (
                <span className="text-[10px] text-slate-500">General ML mode active</span>
              )}

              <span className="text-[10px] text-slate-500">Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotPopup;

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDatasetById, clearAllDatasets } from '../services/datasetService';


export const STEP_STATUSES = {
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  ANALYZING: 'ANALYZING',
  RECOMMENDATION_READY: 'RECOMMENDATION_READY',
  APPLIED: 'APPLIED',
  VALIDATED: 'VALIDATED'
};

export const WORKFLOW_STEPS = [
  { 
    id: 'collection', 
    stepNumber: 1, 
    code: '01',
    name: '01. Data Collection', 
    title: 'Data Collection',
    shortName: 'Collection', 
    category: 'Data Ingestion',
    description: 'Collect and ingest raw datasets from files or public repositories',
    educationalConceptId: 'dataset'
  },
  { 
    id: 'loading', 
    stepNumber: 2, 
    code: '02',
    name: '02. Data Loading', 
    title: 'Data Loading',
    shortName: 'Loading', 
    category: 'Data Ingestion',
    description: 'Load tabular data into memory as a typed DataFrame representation',
    educationalConceptId: 'data_type'
  },
  { 
    id: 'eda', 
    stepNumber: 3, 
    code: '03',
    name: '03. EDA Process', 
    title: 'EDA Process',
    shortName: 'EDA', 
    category: 'Exploratory Analysis',
    description: 'Statistical inspection, moments, correlation, and distribution analysis',
    educationalConceptId: 'skewness'
  },
  { 
    id: 'cleaning', 
    stepNumber: 4, 
    code: '04',
    name: '04. Data Cleaning', 
    title: 'Data Cleaning',
    shortName: 'Cleaning', 
    category: 'Data Quality',
    description: 'Missing value imputation, duplicate removal, and invalid value sanitization',
    educationalConceptId: 'missing_values'
  },
  { 
    id: 'outliers', 
    stepNumber: 5, 
    code: '05',
    name: '05. Outlier Detection', 
    title: 'Outlier Detection & Treatment',
    shortName: 'Outliers', 
    category: 'Data Quality',
    description: 'IQR, Z-Score, Modified Z-Score detection and explainable treatments',
    educationalConceptId: 'outlier'
  },
  { 
    id: 'encoding', 
    stepNumber: 6, 
    code: '06',
    name: '06. Data Encoding', 
    title: 'Data Encoding',
    shortName: 'Encoding', 
    category: 'Feature Transformation',
    description: 'One-Hot, Label, and Ordinal categorical numerical encoding',
    educationalConceptId: 'categorical_data'
  },
  { 
    id: 'scaling', 
    stepNumber: 7, 
    code: '07',
    name: '07. Feature Scaling', 
    title: 'Feature Scaling / Normalization',
    shortName: 'Scaling', 
    category: 'Feature Transformation',
    description: 'StandardScaler, MinMaxScaler, RobustScaler, and Power Transformations',
    educationalConceptId: 'feature_scaling'
  },
  { 
    id: 'dimensionality', 
    stepNumber: 8, 
    code: '08',
    name: '08. Dimensionality Reduction', 
    title: 'Dimensionality Reduction',
    shortName: 'Dim Reduction', 
    category: 'Dimensionality & Selection',
    description: 'PCA, LDA, and SVD subspace transformations with explained variance',
    educationalConceptId: 'feature_engineering'
  },
  { 
    id: 'feature_selection', 
    stepNumber: 9, 
    code: '09',
    name: '09. Feature Selection', 
    title: 'Feature Selection',
    shortName: 'Selection', 
    category: 'Dimensionality & Selection',
    description: 'SelectKBest scoring, ranking, and top feature filtering',
    educationalConceptId: 'feature_leakage'
  },
  { 
    id: 'split', 
    stepNumber: 10, 
    code: '10',
    name: '10. Train-Test Split', 
    title: 'Train-Test Split',
    shortName: 'Split', 
    category: 'Model Pipeline',
    description: 'Stratified train/test dataset partition with leakage prevention',
    educationalConceptId: 'data_leakage'
  },
  { 
    id: 'fitting', 
    stepNumber: 11, 
    code: '11',
    name: '11. Model Fitting', 
    title: 'Model Fitting',
    shortName: 'Model Fitting', 
    category: 'Model Pipeline',
    description: 'Fit algorithms on X_train / y_train with progress tracking',
    educationalConceptId: 'fit_vs_transform'
  },
  { 
    id: 'prediction', 
    stepNumber: 12, 
    code: '12',
    name: '12. Model Prediction', 
    title: 'Model Prediction',
    shortName: 'Prediction', 
    category: 'Model Pipeline',
    description: 'Generate predictions y_pred from X_test with confidence scoring',
    educationalConceptId: 'target'
  },
  { 
    id: 'evaluation', 
    stepNumber: 13, 
    code: '13',
    name: '13. Model Evaluation', 
    title: 'Model Evaluation',
    shortName: 'Evaluation', 
    category: 'Model Pipeline',
    description: 'Compare y_pred vs y_test (RMSE, R², Accuracy, Confusion Matrix)',
    educationalConceptId: 'data_transformation'
  }
];

const WorkflowContext = createContext(null);

// ── URL Hash Helpers ────────────────────────────────────────
// Maps stepId → clean URL slug  (e.g. 'collection' → '/studio/collection')
const ROUTE_MAP = {
  // Ecosystem & Landing Pages
  landing:        '/',
  home:           '/',
  techmentor:     '/',
  ecosystem:      '/',

  // Suite Landing Pages
  menti:                  '/menti-ai',
  'menti-landing':        '/menti-ai',
  'menti-ai-landing':     '/menti-ai',
  datamentor:             '/datamentor',
  'datamentor-landing':   '/datamentor',
  'data-mentor':          '/datamentor',
  'data-mentor-landing':  '/datamentor',
  genaimentor:            '/genaimentor',
  genai:                  '/genaimentor',
  'genai-landing':        '/genaimentor',
  'rag-landing':          '/genaimentor',
  agenticaimentor:        '/agentic-ai',
  agentic:                '/agentic-ai',
  'agentic-landing':      '/agentic-ai',
  agenticai:              '/agentic-ai',
  nlpmentor:              '/nlp',
  nlp:                    '/nlp',
  'nlp-landing':          '/nlp',
  dlmentor:               '/dl',
  dl:                     '/dl',
  'dl-landing':           '/dl',

  // Studios & Workspaces
  chatbot:            '/studio/menti-ai',
  'menti-ai':         '/studio/menti-ai',
  'datamentor-ai':    '/studio/menti-ai',
  'knowledge-base':   '/studio/knowledge-base',
  'learning-hub':     '/studio/learning-hub',
  dashboard:          '/studio/dashboard',

  // Coming Soon Studios
  'agentic-studio-coming-soon': '/studio/agentic-ai',
  'agentic-studio':             '/studio/agentic-ai',
  'nlp-studio-coming-soon':     '/studio/nlp',
  'nlp-studio':                 '/studio/nlp',
  'dl-studio-coming-soon':      '/studio/dl',
  'dl-studio':                  '/studio/dl',

  // 13 ML Pipeline Steps
  collection:         '/studio/pipeline/collection',
  datasets:           '/studio/pipeline/collection',
  loading:            '/studio/pipeline/loading',
  eda:                '/studio/pipeline/eda',
  profiling:          '/studio/pipeline/eda',
  cleaning:           '/studio/pipeline/cleaning',
  outliers:           '/studio/pipeline/outliers',
  encoding:           '/studio/pipeline/encoding',
  scaling:            '/studio/pipeline/scaling',
  transformations:    '/studio/pipeline/scaling',
  dimensionality:     '/studio/pipeline/dimensionality',
  feature_selection:  '/studio/pipeline/feature-selection',
  selection:          '/studio/pipeline/feature-selection',
  split:              '/studio/pipeline/split',
  fitting:            '/studio/pipeline/fitting',
  prediction:         '/studio/pipeline/prediction',
  evaluation:         '/studio/pipeline/evaluation',
  export:             '/studio/pipeline/evaluation',

  // Platform Pages
  about:           '/about',
  'about-us':      '/about',
  features:        '/features',
  'pipeline-features': '/features',
  privacy:         '/privacy',
  'privacy-policy':'/privacy',
  terms:           '/terms',
  'terms-of-service': '/terms',
  security:        '/security',
  'data-safety':   '/security',
  contact:         '/contact',
  support:         '/contact',
  cookies:         '/cookies',
  'cookie-policy': '/cookies',
  changelog:       '/changelog',
  releases:        '/changelog',
  pages:           '/sitemap',
  index:           '/sitemap',
  sitemap:         '/sitemap',
  directory:       '/sitemap',
};

// Reverse lookup: URL slug → canonical stepId
const REVERSE_ROUTE_MAP = {};
(function buildReverse() {
  // Preferred canonical stepId for each slug  (first-write wins)
  const CANONICAL = {
    '/':                              'landing',
    '/menti-ai':                      'menti',
    '/datamentor':                    'datamentor',
    '/genaimentor':                   'genaimentor',
    '/agentic-ai':                    'agenticaimentor',
    '/nlp':                           'nlpmentor',
    '/dl':                            'dlmentor',
    '/studio/menti-ai':               'chatbot',
    '/studio/knowledge-base':         'knowledge-base',
    '/studio/learning-hub':           'learning-hub',
    '/studio/dashboard':              'dashboard',
    '/studio/agentic-ai':             'agentic-studio-coming-soon',
    '/studio/nlp':                    'nlp-studio-coming-soon',
    '/studio/dl':                     'dl-studio-coming-soon',
    '/studio/pipeline/collection':    'collection',
    '/studio/pipeline/loading':       'loading',
    '/studio/pipeline/eda':           'eda',
    '/studio/pipeline/cleaning':      'cleaning',
    '/studio/pipeline/outliers':      'outliers',
    '/studio/pipeline/encoding':      'encoding',
    '/studio/pipeline/scaling':       'scaling',
    '/studio/pipeline/dimensionality':'dimensionality',
    '/studio/pipeline/feature-selection': 'feature_selection',
    '/studio/pipeline/split':         'split',
    '/studio/pipeline/fitting':       'fitting',
    '/studio/pipeline/prediction':    'prediction',
    '/studio/pipeline/evaluation':    'evaluation',
    '/about':                         'about',
    '/features':                      'features',
    '/privacy':                       'privacy',
    '/terms':                         'terms',
    '/security':                      'security',
    '/contact':                       'contact',
    '/cookies':                       'cookies',
    '/changelog':                     'changelog',
    '/sitemap':                       'pages',
  };
  Object.entries(CANONICAL).forEach(([slug, stepId]) => {
    REVERSE_ROUTE_MAP[slug] = stepId;
  });
})();

/** Read the current hash and return the corresponding stepId */
function getStepIdFromHash() {
  const hash = window.location.hash; // e.g. '#/datamentor'
  if (!hash || hash === '#' || hash === '#/') return 'landing';
  const slug = hash.replace(/^#/, '');        // '/datamentor'
  return REVERSE_ROUTE_MAP[slug] || 'landing';
}

export const WorkflowProvider = ({ children }) => {
  const [activeDataset, setActiveDataset] = useState(() => {
    try {
      const saved = localStorage.getItem('datamentor_active_dataset');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Initialize currentStepId from URL hash first, then localStorage, then default
  const [currentStepId, setCurrentStepId] = useState(() => {
    // 1. Try URL hash
    const hashStep = getStepIdFromHash();
    if (hashStep && hashStep !== 'landing') return hashStep;
    // 2. If hash is root or empty, check if there's a meaningful hash
    if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#/') {
      return hashStep;
    }
    // 3. Fall back to localStorage
    try {
      const saved = localStorage.getItem('datamentor_current_step');
      return saved || 'landing';
    } catch (e) {
      return 'landing';
    }
  });

  const [stepMode, setStepMode] = useState('process'); // 'process' | 'learn'
  const [activeConceptModal, setActiveConceptModal] = useState(null);
  
  // Step state map
  const [stepStates, setStepStates] = useState(() => {
    try {
      const saved = localStorage.getItem('datamentor_step_states');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    const initial = {};
    WORKFLOW_STEPS.forEach((step, idx) => {
      initial[step.id] = idx === 0 ? STEP_STATUSES.AVAILABLE : STEP_STATUSES.LOCKED;
    });
    return initial;
  });

  // Sync activeDataset to localStorage
  useEffect(() => {
    try {
      if (activeDataset) {
        localStorage.setItem('datamentor_active_dataset', JSON.stringify(activeDataset));
      } else {
        localStorage.removeItem('datamentor_active_dataset');
      }
    } catch (e) {}
  }, [activeDataset]);

  // Sync currentStepId to localStorage AND URL hash
  useEffect(() => {
    try {
      if (currentStepId) {
        localStorage.setItem('datamentor_current_step', currentStepId);
      }
    } catch (e) {}
  }, [currentStepId]);

  // Listen for browser back/forward (popstate) events
  useEffect(() => {
    const handlePopState = () => {
      const stepId = getStepIdFromHash();
      setCurrentStepId(stepId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync stepStates to localStorage
  useEffect(() => {
    try {
      if (stepStates) {
        localStorage.setItem('datamentor_step_states', JSON.stringify(stepStates));
      }
    } catch (e) {}
  }, [stepStates]);

  // Verify and re-hydrate dataset from backend on mount
  useEffect(() => {
    if (activeDataset?.dataset_id) {
      getDatasetById(activeDataset.dataset_id).then(res => {
        if (res.data) {
          setActiveDataset(res.data);
        } else if (res.error && res.error.toLowerCase().includes('not found')) {
          setActiveDataset(null);
          try {
            localStorage.removeItem('datamentor_active_dataset');
          } catch (e) {}
        }
      }).catch(() => {});
    }
  }, []);

  // When active dataset changes, make steps up to Step 3 available
  useEffect(() => {
    if (activeDataset?.dataset_id) {
      setStepStates(prev => ({
        ...prev,
        collection: STEP_STATUSES.APPLIED,
        loading: STEP_STATUSES.APPLIED,
        eda: STEP_STATUSES.AVAILABLE,
        cleaning: prev.cleaning === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.cleaning,
        outliers: prev.outliers === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.outliers,
        encoding: prev.encoding === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.encoding,
        scaling: prev.scaling === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.scaling,
        dimensionality: prev.dimensionality === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.dimensionality,
        feature_selection: prev.feature_selection === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.feature_selection,
        split: prev.split === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.split,
        fitting: prev.fitting === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.fitting,
        prediction: prev.prediction === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.prediction,
        evaluation: prev.evaluation === STEP_STATUSES.LOCKED ? STEP_STATUSES.AVAILABLE : prev.evaluation
      }));
    }
  }, [activeDataset?.dataset_id]);

  const clearActiveDataset = () => {
    setActiveDataset(null);
    try {
      localStorage.removeItem('datamentor_active_dataset');
    } catch (e) {}
    const initial = {};
    WORKFLOW_STEPS.forEach((step, idx) => {
      initial[step.id] = idx === 0 ? STEP_STATUSES.AVAILABLE : STEP_STATUSES.LOCKED;
    });
    setStepStates(initial);
    setCurrentStepId('collection');
  };

  const removeAllDatasets = async () => {
    try {
      await clearAllDatasets();
    } catch (e) {}
    clearActiveDataset();
  };


  const STEP_ALIASES = {
    datasets: 'collection',
    dataset: 'collection',
    profiling: 'eda',
    transformations: 'scaling',
    selection: 'feature_selection',
    features: 'feature_selection',
    export: 'evaluation'
  };

  const updateStepStatus = (stepId, status) => {
    const targetId = STEP_ALIASES[stepId] || stepId;
    setStepStates(prev => ({
      ...prev,
      [targetId]: status
    }));
  };

  const goToStep = useCallback((stepId) => {
    if (!stepId) return;
    const targetId = STEP_ALIASES[stepId] || stepId;
    // Update URL hash (push to history so back button works)
    const slug = ROUTE_MAP[targetId] || ROUTE_MAP[stepId] || `/${targetId}`;
    const newHash = `#${slug}`;
    if (window.location.hash !== newHash) {
      window.history.pushState({ stepId: targetId }, '', newHash);
    }
    setCurrentStepId(targetId);
  }, []);

  const nextStep = () => {
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStepId);
    if (currentIndex >= 0 && currentIndex < WORKFLOW_STEPS.length - 1) {
      const next = WORKFLOW_STEPS[currentIndex + 1];
      goToStep(next.id);
    } else if (currentStepId === 'dashboard') {
      goToStep('collection');
    }
  };

  const prevStep = () => {
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStepId);
    if (currentIndex > 0) {
      const prev = WORKFLOW_STEPS[currentIndex - 1];
      goToStep(prev.id);
    }
  };

  const openConceptModal = (conceptId) => {
    setActiveConceptModal(conceptId);
  };

  const closeConceptModal = () => {
    setActiveConceptModal(null);
  };

  const completedStepsCount = Object.values(stepStates).filter(
    s => s === STEP_STATUSES.APPLIED || s === STEP_STATUSES.VALIDATED
  ).length;

  const currentStepObj = WORKFLOW_STEPS.find(s => s.id === currentStepId) || WORKFLOW_STEPS[0];

  const value = {
    steps: WORKFLOW_STEPS,
    currentStepId,
    currentStepObj,
    stepStates,
    stepMode,
    activeDataset,
    activeConceptModal,
    completedStepsCount,
    totalSteps: WORKFLOW_STEPS.length,
    setActiveDataset,
    clearActiveDataset,
    removeAllDatasets,
    updateStepStatus,
    goToStep,
    nextStep,
    prevStep,
    setStepMode,
    openConceptModal,
    closeConceptModal
  };


  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export default WorkflowContext;

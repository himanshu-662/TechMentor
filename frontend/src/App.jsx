import React from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import { WorkflowProvider, useWorkflow } from './state/WorkflowContext';

// Step Pages 01 to 13
import Step01DataCollection from './pages/steps/Step01DataCollection';
import Step02DataLoading from './pages/steps/Step02DataLoading';
import Step03EDA from './pages/steps/Step03EDA';
import Step04DataCleaning from './pages/steps/Step04DataCleaning';
import Step05Outliers from './pages/steps/Step05Outliers';
import Step06DataEncoding from './pages/steps/Step06DataEncoding';
import Step07FeatureScaling from './pages/steps/Step07FeatureScaling';
import Step08Dimensionality from './pages/steps/Step08Dimensionality';
import Step09FeatureSelection from './pages/steps/Step09FeatureSelection';
import Step10TrainTestSplit from './pages/steps/Step10TrainTestSplit';
import Step11ModelFitting from './pages/steps/Step11ModelFitting';
import Step12Prediction from './pages/steps/Step12Prediction';
import Step13Evaluation from './pages/steps/Step13Evaluation';

// Standalone & Legal Pages
import LandingPage from './pages/LandingPage';
import TechMentorLandingPage from './pages/TechMentorLandingPage';
import MentiAILandingPage from './pages/suites/MentiAILandingPage';
import DataMentorLandingPage from './pages/suites/DataMentorLandingPage';
import GenAIMentorLandingPage from './pages/suites/GenAIMentorLandingPage';
import AgenticAIMentorLandingPage from './pages/suites/AgenticAIMentorLandingPage';
import NLPMentorLandingPage from './pages/suites/NLPMentorLandingPage';
import DLMentorLandingPage from './pages/suites/DLMentorLandingPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SecurityPage from './pages/SecurityPage';
import ContactPage from './pages/ContactPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import ChangelogPage from './pages/ChangelogPage';
import PageIndexPage from './pages/PageIndexPage';
import StudioComingSoonPage from './pages/StudioComingSoonPage';

// Workspace & Dashboard Pages
import DashboardPage from './pages/DashboardPage';
import LearningHubPage from './pages/LearningHubPage';
import KnowledgeBase from './pages/KnowledgeBase';
import DataMentorAIPage from './pages/DataMentorAIPage';
import ConceptModal from './components/education/ConceptModal';
import Badge from './components/common/Badge';
import ErrorBoundary from './components/common/ErrorBoundary';
import ChatbotPopup from './components/chat/ChatbotPopup';
import { MessageSquareCode, Sparkles } from 'lucide-react';

function AppContent() {
  const { 
    currentStepId, 
    goToStep, 
    activeConceptModal, 
    closeConceptModal,
    activeDataset 
  } = useWorkflow();

  // Legacy / RAG aliases -> GenAIMentor Landing Page
  if (
    currentStepId === 'aimentor' || 
    currentStepId === 'ai-mentor' || 
    currentStepId === 'rag' || 
    currentStepId === 'aimentor-coming-soon'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <GenAIMentorLandingPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Menti.ai Dedicated Socratic Tutor Workspace
  if (
    currentStepId === 'chatbot' || 
    currentStepId === 'menti-ai' ||
    currentStepId === 'datamentor-ai'
  ) {
    return (
      <div className="w-full h-screen bg-slate-950 text-slate-100 overflow-hidden">
        <DataMentorAIPage />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Suite 01: Menti.AI Dedicated Landing Page
  if (
    currentStepId === 'menti' ||
    currentStepId === 'menti-landing' ||
    currentStepId === 'menti-ai-landing'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <MentiAILandingPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Suite 02: DataMentor Dedicated Landing Page
  if (
    currentStepId === 'datamentor' ||
    currentStepId === 'datamentor-landing' ||
    currentStepId === 'data-mentor' ||
    currentStepId === 'data-mentor-landing'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <DataMentorLandingPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Suite 03: GenAIMentor Dedicated Landing Page
  if (
    currentStepId === 'genaimentor' ||
    currentStepId === 'genai' ||
    currentStepId === 'genai-landing' ||
    currentStepId === 'rag-landing'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <GenAIMentorLandingPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Suite 04: AgenticAIMentor Dedicated Landing Page
  if (
    currentStepId === 'agenticaimentor' ||
    currentStepId === 'agentic' ||
    currentStepId === 'agentic-landing' ||
    currentStepId === 'agenticai'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <AgenticAIMentorLandingPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Suite 05: NLPMentor Dedicated Landing Page
  if (
    currentStepId === 'nlpmentor' ||
    currentStepId === 'nlp' ||
    currentStepId === 'nlp-landing'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <NLPMentorLandingPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Suite 06: DLMentor Dedicated Landing Page
  if (
    currentStepId === 'dlmentor' ||
    currentStepId === 'dl' ||
    currentStepId === 'dl-landing'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <DLMentorLandingPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Universal Ecosystem Landing Page
  if (
    currentStepId === 'landing' || 
    currentStepId === 'home' ||
    currentStepId === 'techmentor' ||
    currentStepId === 'ecosystem'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <TechMentorLandingPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width About Page
  if (currentStepId === 'about' || currentStepId === 'about-us') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <AboutPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Features Deep-Dive Page
  if (currentStepId === 'features' || currentStepId === 'pipeline-features') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <FeaturesPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Privacy Policy Page
  if (currentStepId === 'privacy' || currentStepId === 'privacy-policy') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <PrivacyPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Terms of Service Page
  if (currentStepId === 'terms' || currentStepId === 'terms-of-service') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <TermsPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Security & Safety Page
  if (currentStepId === 'security' || currentStepId === 'data-safety') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <SecurityPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Contact & Support Page
  if (currentStepId === 'contact' || currentStepId === 'support') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <ContactPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Cookie Policy Page
  if (currentStepId === 'cookies' || currentStepId === 'cookie-policy') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <CookiePolicyPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Changelog Page
  if (currentStepId === 'changelog' || currentStepId === 'releases') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <ChangelogPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Full-Width Page Index & Directory
  if (
    currentStepId === 'pages' ||
    currentStepId === 'index' ||
    currentStepId === 'sitemap' ||
    currentStepId === 'directory'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <PageIndexPage
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  // Standalone Studio Coming Soon Pages for Unbuilt Suites
  if (
    currentStepId === 'agentic-studio-coming-soon' ||
    currentStepId === 'agentic-studio'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <StudioComingSoonPage
          suiteId="agenticaimentor"
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  if (
    currentStepId === 'nlp-studio-coming-soon' ||
    currentStepId === 'nlp-studio'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <StudioComingSoonPage
          suiteId="nlpmentor"
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  if (
    currentStepId === 'dl-studio-coming-soon' ||
    currentStepId === 'dl-studio'
  ) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100">
        <StudioComingSoonPage
          suiteId="dlmentor"
          onLaunchStudio={() => goToStep('collection')}
          onNavigate={(stepId) => goToStep(stepId)}
        />
        <ChatbotPopup />
        <ConceptModal
          isOpen={Boolean(activeConceptModal)}
          onClose={closeConceptModal}
          conceptId={activeConceptModal}
          datasetId={activeDataset?.dataset_id}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentStepId) {
      case 'landing':
      case 'home':
      case 'techmentor':
      case 'ecosystem':
        return (
          <TechMentorLandingPage
            onLaunchStudio={() => goToStep('collection')}
            onNavigate={(stepId) => goToStep(stepId)}
          />
        );
      case 'menti':
      case 'menti-landing':
        return <MentiAILandingPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'datamentor':
      case 'datamentor-landing':
      case 'data-mentor':
        return <DataMentorLandingPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'genaimentor':
      case 'genai':
      case 'genai-landing':
        return <GenAIMentorLandingPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'agenticaimentor':
      case 'agentic':
      case 'agentic-landing':
        return <AgenticAIMentorLandingPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'nlpmentor':
      case 'nlp':
      case 'nlp-landing':
        return <NLPMentorLandingPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'dlmentor':
      case 'dl':
      case 'dl-landing':
        return <DLMentorLandingPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'about':
        return <AboutPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'features':
        return <FeaturesPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'privacy':
        return <PrivacyPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'terms':
        return <TermsPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'security':
        return <SecurityPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'contact':
        return <ContactPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'cookies':
        return <CookiePolicyPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'changelog':
        return <ChangelogPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'pages':
      case 'index':
      case 'sitemap':
      case 'directory':
        return <PageIndexPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'agentic-studio-coming-soon':
      case 'agentic-studio':
        return <StudioComingSoonPage suiteId="agenticaimentor" onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'nlp-studio-coming-soon':
      case 'nlp-studio':
        return <StudioComingSoonPage suiteId="nlpmentor" onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'dl-studio-coming-soon':
      case 'dl-studio':
        return <StudioComingSoonPage suiteId="dlmentor" onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;
      case 'aimentor':
      case 'ai-mentor':
      case 'rag':
        return <GenAIMentorLandingPage onLaunchStudio={() => goToStep('collection')} onNavigate={goToStep} />;

      case 'dashboard':
        return <DashboardPage onNavigate={goToStep} />;

      // 13 ML Pipeline Steps
      case 'collection':
      case 'datasets':
        return <Step01DataCollection />;
      case 'loading':
        return <Step02DataLoading />;
      case 'eda':
      case 'profiling':
        return <Step03EDA />;
      case 'cleaning':
        return <Step04DataCleaning />;
      case 'outliers':
        return <Step05Outliers />;
      case 'encoding':
        return <Step06DataEncoding />;
      case 'scaling':
      case 'transformations':
        return <Step07FeatureScaling />;
      case 'dimensionality':
        return <Step08Dimensionality />;
      case 'feature_selection':
      case 'selection':
        return <Step09FeatureSelection />;
      case 'split':
        return <Step10TrainTestSplit />;
      case 'fitting':
        return <Step11ModelFitting />;
      case 'prediction':
        return <Step12Prediction />;
      case 'evaluation':
      case 'export':
        return <Step13Evaluation />;

      // Learning & Mentor Pages
      case 'knowledge-base':
        return <KnowledgeBase />;
      case 'learning-hub':
        return <LearningHubPage />;

      default:
        return <DashboardPage onNavigate={goToStep} />;
    }
  };

  return (
    <DashboardLayout activeTab={currentStepId} onSelectTab={goToStep}>
      {renderContent()}

      {/* Global Pedagogical Concept Modal */}
      <ConceptModal
        isOpen={Boolean(activeConceptModal)}
        onClose={closeConceptModal}
        conceptId={activeConceptModal}
        datasetId={activeDataset?.dataset_id}
      />
    </DashboardLayout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <WorkflowProvider>
        <AppContent />
      </WorkflowProvider>
    </ErrorBoundary>
  );
}

export default App;


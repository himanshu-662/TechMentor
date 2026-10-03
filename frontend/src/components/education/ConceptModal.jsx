import React, { useEffect, useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { getConcept, explainConcept } from '../../services/educationService';
import LearningCard from './LearningCard';
import Badge from '../common/Badge';

export const ConceptModal = ({
  isOpen,
  onClose,
  conceptId,
  datasetId = null,
  column = null,
  initialLevel = 'beginner'
}) => {
  const [activeConceptId, setActiveConceptId] = useState(conceptId);
  const [conceptData, setConceptData] = useState(null);
  const [explanationResponse, setExplanationResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveConceptId(conceptId);
  }, [conceptId]);

  useEffect(() => {
    if (!isOpen || !activeConceptId) {
      setConceptData(null);
      setExplanationResponse(null);
      return;
    }

    const fetchEducationData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch contextual explanation (grounds with dataset profiling if available)
        const explainRes = await explainConcept({
          concept_id: activeConceptId,
          dataset_id: datasetId,
          column: column,
          level: initialLevel
        });

        // Also fetch base full concept schema for rich tables, traps, and checks
        const conceptRes = await getConcept(activeConceptId);

        if (conceptRes.error && explainRes.error) {
          setError(conceptRes.error || explainRes.error);
        } else {
          setConceptData(conceptRes.data);
          setExplanationResponse(explainRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load concept information.');
      } finally {
        setLoading(false);
      }
    };

    fetchEducationData();
  }, [isOpen, activeConceptId, datasetId, column, initialLevel]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-brand-500/10 text-brand-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Interactive Educational Guide
            </span>
            {column && (
              <Badge variant="brand" className="font-mono">
                {column}
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
              <p className="text-sm">Loading pedagogical concept...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm">
              <p className="font-semibold mb-1">Concept Lookup Error</p>
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}

          {!loading && !error && conceptData && (
            <div className="space-y-4">
              <LearningCard
                concept={conceptData}
                evidence={explanationResponse?.dataset_evidence}
                initialLevel={initialLevel}
                onSelectConcept={(id) => setActiveConceptId(id)}
                columnName={column}
                embedded={false}
              />

              {explanationResponse?.next_step && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-brand-500/30 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-brand-500/20 text-brand-400 font-bold uppercase text-[10px]">
                      Next Pipeline Step
                    </span>
                    <span className="text-slate-300">{explanationResponse.next_step}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptModal;

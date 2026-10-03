import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Lightbulb } from 'lucide-react';
import Badge from '../common/Badge';

export const KnowledgeCheck = ({ knowledgeCheck, conceptTitle }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!knowledgeCheck) {
    return null;
  }

  const { question, options, correct_option_index, explanation } = knowledgeCheck;
  const isCorrect = submitted && selectedOption === correct_option_index;

  const handleSelect = (index) => {
    if (!submitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-md">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Knowledge Check
          </span>
        </div>
        {conceptTitle && (
          <Badge variant="default" className="text-xs text-slate-400">
            {conceptTitle}
          </Badge>
        )}
      </div>

      <h4 className="text-sm font-medium text-slate-100 mb-4 leading-relaxed">
        {question}
      </h4>

      {/* Options List */}
      <div className="space-y-2 mb-4">
        {options.map((option, idx) => {
          let optionStyles = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300';
          let indicator = null;

          if (!submitted) {
            if (selectedOption === idx) {
              optionStyles = 'border-brand-500/80 bg-brand-500/10 text-white font-medium shadow-sm';
            }
          } else {
            // Submitted state
            if (idx === correct_option_index) {
              optionStyles = 'border-brand-500 bg-brand-500/10 text-brand-300 font-medium';
              indicator = <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />;
            } else if (selectedOption === idx) {
              optionStyles = 'border-rose-500 bg-rose-500/10 text-rose-300';
              indicator = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            } else {
              optionStyles = 'border-slate-850 bg-slate-950/30 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={submitted}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${optionStyles} ${
                submitted ? 'cursor-default' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  selectedOption === idx
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>
              {indicator}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
            selectedOption !== null
              ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Check Answer
        </button>
      ) : (
        <div className="space-y-3">
          <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
            isCorrect
              ? 'bg-brand-950/40 border-brand-500/40 text-brand-200'
              : 'bg-rose-950/30 border-rose-500/40 text-slate-200'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <Lightbulb className={`w-3.5 h-3.5 ${isCorrect ? 'text-brand-400' : 'text-amber-400'}`} />
              <span>{isCorrect ? 'Well done! That is correct.' : 'Concept Explanation:'}</span>
            </div>
            <p className="text-slate-300">{explanation}</p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeCheck;

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Divide, 
  Calendar, 
  Clock, 
  Layers, 
  Hash, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Plus, 
  Play, 
  AlertCircle,
  HelpCircle,
  Sliders,
  Wand2
} from 'lucide-react';
import Badge from '../common/Badge';

const FEATURE_TYPES = [
  { id: 'mathematical', label: 'Mathematical Math', icon: Divide, description: 'Arithmetic formulas, power, sqrt, log' },
  { id: 'interaction', label: 'Interaction (A × B)', icon: Sparkles, description: 'Pairwise multiplicative synergies' },
  { id: 'ratio', label: 'Ratio & Rate (A / B)', icon: Divide, description: 'Per-unit densities with zero protection' },
  { id: 'datetime_parts', label: 'Datetime Parts', icon: Calendar, description: 'Year, Month, Day, Weekday, Hour' },
  { id: 'cyclical', label: 'Cyclical (Sin/Cos)', icon: Clock, description: '2D continuous periodic embeddings' },
  { id: 'date_difference', label: 'Date Difference', icon: Clock, description: 'Elapsed duration in Days or Hours' },
  { id: 'aggregation', label: 'Group Aggregations', icon: Layers, description: 'Groupby mean, sum, count, std' },
  { id: 'binning', label: 'Binning & Intervals', icon: Hash, description: 'Discretize continuous numbers' },
  { id: 'indicator', label: 'Threshold Flag', icon: CheckCircle2, description: 'Binary 0/1 boolean indicator flags' },
  { id: 'frequency', label: 'Frequency Encoding', icon: TrendingUp, description: 'Category popularity counts' },
  { id: 'text_statistics', label: 'Text Statistics', icon: FileText, description: 'Word counts, character lengths' },
];

export const FeatureBuilder = ({ 
  columns = [], 
  onPreview, 
  loading = false,
  presetOpportunity = null,
  onOpenConcept 
}) => {
  const [featureType, setFeatureType] = useState('mathematical');
  const [featureName, setFeatureName] = useState('');
  const [params, setParams] = useState({});
  const [nameError, setNameError] = useState('');

  // When preset opportunity selected, populate builder
  useEffect(() => {
    if (presetOpportunity) {
      setFeatureType(presetOpportunity.feature_type);
      setFeatureName(presetOpportunity.suggested_feature_name);
      setParams(presetOpportunity.suggested_params || {});
    }
  }, [presetOpportunity]);

  // Set default sensible feature name when changing type if empty
  useEffect(() => {
    if (!featureName && columns.length > 0) {
      const colA = columns[0];
      if (featureType === 'mathematical') setFeatureName(`${colA}_scaled`);
      else if (featureType === 'interaction') setFeatureName(`${colA}_interaction`);
      else if (featureType === 'ratio') setFeatureName(`${colA}_ratio`);
      else if (featureType === 'datetime_parts') setFeatureName(`${colA}_dayofweek`);
      else if (featureType === 'cyclical') setFeatureName(`${colA}_sin`);
      else if (featureType === 'date_difference') setFeatureName(`duration_${colA}_days`);
      else if (featureType === 'aggregation') setFeatureName(`${colA}_avg`);
      else if (featureType === 'binning') setFeatureName(`${colA}_bin`);
      else if (featureType === 'indicator') setFeatureName(`is_${colA}_high`);
      else if (featureType === 'frequency') setFeatureName(`${colA}_freq`);
      else if (featureType === 'text_statistics') setFeatureName(`${colA}_word_count`);
    }
  }, [featureType]);

  const handleNameChange = (val) => {
    setFeatureName(val);
    if (columns.includes(val.trim())) {
      setNameError(`A column named '${val}' already exists.`);
    } else if (val.trim() && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val.trim())) {
      setNameError('Use only letters, numbers, and underscores (starting with letter/underscore).');
    } else {
      setNameError('');
    }
  };

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSimulate = (e) => {
    e.preventDefault();
    if (!featureName.trim() || nameError) return;

    onPreview({
      feature_type: featureType,
      new_feature_name: featureName.trim(),
      params: params
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Manual Feature Builder</h3>
            <p className="text-xs text-slate-400">
              Construct deterministic domain features without writing raw code
            </p>
          </div>
        </div>

        {onOpenConcept && (
          <button
            type="button"
            onClick={() => onOpenConcept(featureType)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Learn {featureType.replace('_', ' ')} concept</span>
          </button>
        )}
      </div>

      {/* Feature Type Category Pills */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Select Feature Engineering Pattern
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {FEATURE_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = featureType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setFeatureType(type.id);
                  setParams({});
                }}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between space-y-1 transition-all ${
                  isSelected
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                </div>
                <span className="text-xs font-semibold block leading-tight">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSimulate} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Feature Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              New Column Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={featureName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. net_profit_usd"
              className={`w-full px-3 py-2 rounded-lg bg-slate-950 border ${
                nameError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-brand-500'
              } text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors`}
              required
            />
            {nameError && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {nameError}
              </span>
            )}
          </div>

          {/* Dynamic Parameters Based on Feature Type */}
          {featureType === 'mathematical' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Operation</label>
                <select
                  value={params.operation || 'add'}
                  onChange={(e) => handleParamChange('operation', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="add">Addition (+)</option>
                  <option value="subtract">Subtraction (-)</option>
                  <option value="multiply">Multiplication (×)</option>
                  <option value="divide">Safe Division (/)</option>
                  <option value="abs">Absolute Value (|x|)</option>
                  <option value="square">Square Power (x²)</option>
                  <option value="sqrt">Square Root (√x)</option>
                  <option value="log1p">Log1p: log(1 + x)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Primary Column (A)</label>
                <select
                  value={params.column_a || columns[0] || ''}
                  onChange={(e) => handleParamChange('column_a', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              {['add', 'subtract', 'multiply', 'divide'].includes(params.operation || 'add') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Secondary Column (B) or Constant</label>
                  <select
                    value={params.column_b || ''}
                    onChange={(e) => handleParamChange('column_b', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select column B (or use scalar below)...</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              )}
            </>
          )}

          {featureType === 'interaction' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">First Column (A)</label>
                <select
                  value={params.column_a || columns[0] || ''}
                  onChange={(e) => handleParamChange('column_a', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Second Column (B)</label>
                <select
                  value={params.column_b || columns[1] || ''}
                  onChange={(e) => handleParamChange('column_b', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            </>
          )}

          {featureType === 'ratio' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Numerator Column</label>
                <select
                  value={params.numerator_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('numerator_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select numerator...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Denominator Column</label>
                <select
                  value={params.denominator_column || columns[1] || ''}
                  onChange={(e) => handleParamChange('denominator_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select denominator...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Division-by-Zero Policy</label>
                <select
                  value={params.division_by_zero_policy || 'nan'}
                  onChange={(e) => handleParamChange('division_by_zero_policy', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="nan">Set to NaN (Missing)</option>
                  <option value="zero">Set to 0.0</option>
                  <option value="custom_value">Custom Value</option>
                </select>
              </div>
            </>
          )}

          {featureType === 'datetime_parts' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Datetime Column</label>
                <select
                  value={params.datetime_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('datetime_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Date Part Component</label>
                <select
                  value={params.part || 'weekday'}
                  onChange={(e) => handleParamChange('part', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="weekday">Day of Week (0=Mon, 6=Sun)</option>
                  <option value="month">Month (1 to 12)</option>
                  <option value="year">Calendar Year</option>
                  <option value="day">Day of Month (1 to 31)</option>
                  <option value="hour">Hour of Day (0 to 23)</option>
                  <option value="quarter">Fiscal Quarter (1 to 4)</option>
                  <option value="day_of_year">Day of Year (1 to 366)</option>
                  <option value="is_weekend">Is Weekend Flag (0/1)</option>
                </select>
              </div>
            </>
          )}

          {featureType === 'cyclical' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Temporal Column</label>
                <select
                  value={params.datetime_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('datetime_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Periodic Cycle</label>
                <select
                  value={params.period_type || 'hour_24'}
                  onChange={(e) => handleParamChange('period_type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="hour_24">24-Hour Daily Cycle</option>
                  <option value="month_12">12-Month Annual Seasonality</option>
                  <option value="weekday_7">7-Day Weekly Cycle</option>
                  <option value="day_of_year_365">365-Day Solar Cycle</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Trigonometric Harmonic</label>
                <select
                  value={params.harmonic || 'sin'}
                  onChange={(e) => handleParamChange('harmonic', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="sin">Sine: sin(2π × t / T)</option>
                  <option value="cos">Cosine: cos(2π × t / T)</option>
                </select>
              </div>
            </>
          )}

          {featureType === 'date_difference' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Start Timestamp</label>
                <select
                  value={params.start_datetime_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('start_datetime_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select start timestamp...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">End Timestamp</label>
                <select
                  value={params.end_datetime_column || columns[1] || ''}
                  onChange={(e) => handleParamChange('end_datetime_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select end timestamp...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Duration Unit</label>
                <select
                  value={params.unit || 'days'}
                  onChange={(e) => handleParamChange('unit', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                  <option value="seconds">Seconds</option>
                </select>
              </div>
            </>
          )}

          {featureType === 'aggregation' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Group By Entity</label>
                <select
                  value={params.group_by_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('group_by_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select grouping entity...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Target Numerical Metric</label>
                <select
                  value={params.target_column || columns[1] || ''}
                  onChange={(e) => handleParamChange('target_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select target column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Aggregation Function</label>
                <select
                  value={params.agg_func || 'mean'}
                  onChange={(e) => handleParamChange('agg_func', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="mean">Mean (Average)</option>
                  <option value="sum">Sum (Total)</option>
                  <option value="median">Median (50th percentile)</option>
                  <option value="std">Standard Deviation</option>
                  <option value="min">Minimum</option>
                  <option value="max">Maximum</option>
                  <option value="count">Count (Observations)</option>
                </select>
              </div>
            </>
          )}

          {featureType === 'binning' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Source Column</label>
                <select
                  value={params.source_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('source_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Number of Equal Bins</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={params.num_bins || 4}
                  onChange={(e) => handleParamChange('num_bins', parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          {featureType === 'indicator' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Source Column</label>
                <select
                  value={params.source_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('source_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Comparison Operator</label>
                <select
                  value={params.operator || 'gt'}
                  onChange={(e) => handleParamChange('operator', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="gt">Greater Than (&gt;)</option>
                  <option value="gte">Greater Than or Equal (&ge;)</option>
                  <option value="lt">Less Than (&lt;)</option>
                  <option value="lte">Less Than or Equal (&le;)</option>
                  <option value="eq">Equal to (==)</option>
                  <option value="neq">Not Equal to (!=)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Threshold Value</label>
                <input
                  type="text"
                  value={params.threshold ?? '0'}
                  onChange={(e) => handleParamChange('threshold', e.target.value)}
                  placeholder="e.g. 100.0 or True"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </>
          )}

          {featureType === 'frequency' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Categorical Column</label>
                <select
                  value={params.source_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('source_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select categorical column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Frequency Output Metric</label>
                <select
                  value={params.frequency_type || 'count'}
                  onChange={(e) => handleParamChange('frequency_type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="count">Occurrence Count (Integer)</option>
                  <option value="proportion">Relative Ratio / Proportion ([0, 1])</option>
                </select>
              </div>
            </>
          )}

          {featureType === 'text_statistics' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Text Column</label>
                <select
                  value={params.text_column || columns[0] || ''}
                  onChange={(e) => handleParamChange('text_column', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Select text column...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Statistic Type</label>
                <select
                  value={params.statistic_type || 'word_count'}
                  onChange={(e) => handleParamChange('statistic_type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="word_count">Word Count</option>
                  <option value="char_count">Character Length</option>
                  <option value="sentence_count">Sentence Count</option>
                  <option value="uppercase_count">Uppercase Character Count</option>
                  <option value="digit_count">Digit Count</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Submit & Simulate */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="submit"
            disabled={loading || !!nameError || !featureName.trim()}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? 'Simulating Preview...' : 'Simulate & Preview Feature'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeatureBuilder;

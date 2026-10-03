import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  HelpCircle,
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  Trash2
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import DatasetUploadZone from '../../components/datasets/DatasetUploadZone';
import DatasetHistory from '../../components/datasets/DatasetHistory';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';

import { uploadDataset } from '../../services/datasetService';

const SAMPLE_DATASETS = [
  {
    id: 'sample_titanic',
    name: 'Titanic Survival Dataset',
    description: 'Binary classification: Passenger demographics, ticket class, fare, and survival status.',
    rows: 15,
    domain: 'Classification (Binary)',
    type: 'Classification',
    csv: `passenger_id,survived,pclass,sex,age,sibsp,parch,fare,embarked
1,0,3,male,22,1,0,7.25,S
2,1,1,female,38,1,0,71.2833,C
3,1,3,female,26,0,0,7.925,S
4,1,1,female,35,1,0,53.1,S
5,0,3,male,35,0,0,8.05,S
6,0,3,male,,0,0,8.4583,Q
7,0,1,male,54,0,0,51.8625,S
8,0,3,male,2,3,1,21.075,S
9,1,3,female,27,0,2,11.1333,S
10,1,2,female,14,1,0,30.0708,C
11,1,3,female,4,1,1,16.7,S
12,1,1,female,58,0,0,26.55,S
13,0,3,male,20,0,0,8.05,S
14,0,3,male,39,1,5,31.275,S
15,0,3,female,14,0,0,7.8542,S`
  },
  {
    id: 'sample_churn',
    name: 'Customer Churn Benchmark',
    description: 'Classification: Demographics, tenure, monthly charges, contract type, and churn label.',
    rows: 12,
    domain: 'Classification (Binary)',
    type: 'Classification',
    csv: `customer_id,age,gender,tenure_months,monthly_charges,total_charges,contract_type,churn
1001,34,Female,12,65.50,786.00,Month-to-month,0
1002,45,Male,24,85.20,2044.80,One year,0
1003,29,Female,3,,145.50,Month-to-month,1
1004,52,Male,48,99.00,4752.00,Two year,0
1005,38,Female,8,70.15,561.20,Month-to-month,1
1006,61,Male,60,110.50,6630.00,Two year,0
1007,24,Female,2,45.00,90.00,Month-to-month,1
1008,41,,18,80.00,1440.00,One year,0
1009,33,Male,15,55.75,836.25,Month-to-month,0
1010,48,Female,36,92.40,3326.40,Two year,0
1011,27,Male,6,60.00,360.00,Month-to-month,1
1012,55,Female,30,88.90,2667.00,One year,0`
  },
  {
    id: 'sample_housing',
    name: 'California Housing Prices',
    description: 'Continuous regression: Median house values, age, rooms, and population metrics.',
    rows: 12,
    domain: 'Regression (Continuous)',
    type: 'Regression',
    csv: `med_income,house_age,ave_rooms,ave_bedrooms,population,ave_occup,latitude,longitude,median_house_value
8.3252,41.0,6.9841,1.0238,322.0,2.5555,37.88,-122.23,452600.0
8.3014,21.0,6.2381,0.9718,2401.0,2.1098,37.86,-122.22,358500.0
7.2574,52.0,8.2881,1.0734,496.0,2.8022,37.85,-122.24,352100.0
5.6431,52.0,5.8173,1.0730,558.0,2.5479,37.85,-122.25,341300.0
3.8462,52.0,6.2818,1.0810,565.0,2.1814,37.85,-122.25,342200.0
4.0368,52.0,4.7616,1.1036,413.0,2.1398,37.85,-122.25,269700.0
3.6591,52.0,4.9319,0.9511,1094.0,2.3276,37.84,-122.25,299200.0
3.1200,52.0,4.7975,1.0618,1157.0,2.4104,37.84,-122.25,241400.0
2.0804,42.0,4.2941,1.1176,1206.0,2.0268,37.84,-122.26,226700.0
3.6912,52.0,4.9705,0.9901,1551.0,2.1722,37.84,-122.25,261100.0
3.2031,52.0,5.4776,1.0796,910.0,2.2636,37.85,-122.26,281500.0
3.2705,52.0,4.7724,1.0245,1504.0,2.6065,37.85,-122.26,241800.0`
  }
];

export const Step01DataCollection = () => {
  const { activeDataset, setActiveDataset, clearActiveDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();

  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loadingSample, setLoadingSample] = useState(null);

  const handleFileUpload = async (file) => {
    setErrorMessage(null);
    setUploadState('uploading');
    setUploadProgress(0);

    const result = await uploadDataset(file, (progress) => {
      setUploadProgress(progress);
      if (progress >= 100) {
        setUploadState('processing');
      }
    });

    if (result.data) {
      setActiveDataset(result.data);
      setUploadState('success');
      updateStepStatus('collection', STEP_STATUSES.APPLIED);
      updateStepStatus('loading', STEP_STATUSES.AVAILABLE);
    } else {
      setErrorMessage(result.error);
      setUploadState('error');
    }
  };

  const loadSampleBenchmark = async (sample) => {
    setLoadingSample(sample.id);
    setErrorMessage(null);
    try {
      const blob = new Blob([sample.csv], { type: 'text/csv' });
      const file = new File([blob], `${sample.id}.csv`, { type: 'text/csv' });
      await handleFileUpload(file);
    } catch (err) {
      setErrorMessage('Failed to load sample benchmark: ' + err.message);
    } finally {
      setLoadingSample(null);
    }
  };

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Understanding Data Collection</h3>
            <p className="text-xs text-slate-400">Step 01 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Data collection is the systematic process of gathering observations, measurements, and records from primary (direct sensors, logs, user interactions) or secondary (data warehouses, CSV exports, public open data APIs) sources. 
          The quality, representativeness, and fidelity of collected data sets the upper performance bound for every subsequent machine learning stage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Key Data Collection Protocols
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Observational Data:</strong> Collected without intervention (e.g., website clicks, server logs).</li>
              <li><strong>Experimental Data:</strong> Collected under controlled A/B testing conditions.</li>
              <li><strong>Data Schemas:</strong> JSON (semi-structured), CSV (delimited tabular), Parquet (columnar storage).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Common Data Collection Pitfalls
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Selection Bias:</strong> Sampling a subpopulation that does not reflect real-world deployment.</li>
              <li><strong>Temporal Drift:</strong> Data collected during a holiday or anomaly period.</li>
              <li><strong>Schema Breakage:</strong> Inconsistent delimiter or header formatting.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StepContainer
      stepId="collection"
      title="01 Data Collection"
      subtitle="Gather, ingest, and register raw tabular datasets from CSV, JSON, Excel, or sample archives."
      icon={Database}
      conceptId="dataset"
      learnContent={learnContent}
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <DatasetUploadZone 
            onUpload={handleFileUpload}
            uploadState={uploadState}
            uploadProgress={uploadProgress}
            errorMessage={errorMessage}
            onResetError={() => setErrorMessage(null)}
            onLoadSample={() => loadSampleBenchmark(SAMPLE_DATASETS[1])}
          />
        </div>

        {/* Active Dataset Banner */}
        {activeDataset && (
          <div className="bg-gradient-to-r from-brand-950/40 to-slate-900 border border-brand-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-400">Active Working Dataset</span>
                <h3 className="text-sm font-bold text-white font-mono">{activeDataset.filename || activeDataset.name || 'dataset.csv'}</h3>
                <p className="text-xs text-slate-400">
                  {activeDataset.shape ? `${activeDataset.shape.rows} rows × ${activeDataset.shape.columns} columns` : 'Dataset active in memory'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <button
                onClick={clearActiveDataset}
                title="Remove this active dataset from current workspace"
                className="px-3.5 py-2 bg-slate-800/90 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Remove Active</span>
              </button>

              <button
                onClick={() => goToStep('loading')}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <span>Proceed to 02. Data Loading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}


        {/* Stored Dataset History */}
        <DatasetHistory />

        {/* Quick Start Curated Samples */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Or Ingest a Curated Benchmark Dataset
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_DATASETS.map((sample) => (
              <div 
                key={sample.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-500/20 font-mono">
                      {sample.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{sample.rows} rows</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2">{sample.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </div>

                <button
                  onClick={() => loadSampleBenchmark(sample)}
                  disabled={loadingSample === sample.id || uploadState === 'uploading'}
                  className="w-full py-1.5 px-3 bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  {loadingSample === sample.id ? (
                    <span>Ingesting Benchmark...</span>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Select Benchmark</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StepContainer>
  );
};

export default Step01DataCollection;

import React from 'react';
import { LandingPage } from '../LandingPage';

/**
 * DataMentor Dedicated Landing Page
 * Uses the complete, comprehensive 13-stage interactive ML studio landing page
 * including Skewness/Log1p sandboxes, Outlier Tukey fences, What-If Titanic predictor,
 * 7 Explainability Pillars, and step-by-step pipeline visualizers.
 */
export const DataMentorLandingPage = ({ onNavigate, onLaunchStudio }) => {
  return <LandingPage onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />;
};

export default DataMentorLandingPage;

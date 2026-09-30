import React, { createContext, useState, useContext } from 'react';

/**
 * Workflow State Machine for 8-Step Dam Break Analysis
 * 
 * STEP 1: Study Area Selection
 * STEP 2: Data Preparation
 * STEP 3: Breach Scenario Definition
 * STEP 4: Hydrodynamic Model Setup
 * STEP 5: Flood Simulation (Interactive)
 * STEP 6: Impact & Risk Analysis
 * STEP 7: Evacuation Decision Support
 * STEP 8: Results & Report
 */

const WORKFLOW_STEPS = [
  { id: 1, key: 'studyArea', label: 'Study Area', description: 'Select dam and region' },
  { id: 2, key: 'dataPrep', label: 'Data Preparation', description: 'Load study data' },
  { id: 3, key: 'breachScenario', label: 'Breach Scenario', description: 'Define failure parameters' },
  { id: 4, key: 'hydrodynamics', label: 'Hydrodynamic Model', description: 'Configure solver' },
  { id: 5, key: 'floodSim', label: 'Flood Simulation', description: 'Interactive visualization' },
  { id: 6, key: 'impact', label: 'Impact & Risk', description: 'Analyze consequences' },
  { id: 7, key: 'evacuation', label: 'Evacuation Support', description: 'Plan evacuation' },
  { id: 8, key: 'report', label: 'Results & Report', description: 'Generate final report' }
];

export const WorkflowContext = createContext();

export function WorkflowProvider({ children }) {
  // Track current workflow step (1-8)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Track which steps are completed
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Track workflow data
  const [workflowData, setWorkflowData] = useState({
    selectedDamId: null,
    scenarioParams: null,
    simulationId: null,
    selectedVillageForEvac: null
  });

  // Advance to next step (only if current step completed)
  const goToStep = (stepNumber) => {
    if (stepNumber < currentStep) {
      // Allow going backward to completed steps
      setCurrentStep(stepNumber);
    } else if (stepNumber === currentStep + 1 && completedSteps.includes(currentStep)) {
      // Allow going forward only if current step is completed
      setCurrentStep(stepNumber);
    }
  };

  // Mark current step as completed and optionally advance
  const completeStep = (data = {}, advance = true) => {
    setWorkflowData(prev => ({ ...prev, ...data }));
    
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    if (advance && currentStep < WORKFLOW_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setWorkflowData({
      selectedDamId: null,
      scenarioParams: null,
      simulationId: null,
      selectedVillageForEvac: null
    });
  };

  const getCurrentStepInfo = () => WORKFLOW_STEPS[currentStep - 1];

  return (
    <WorkflowContext.Provider
      value={{
        currentStep,
        completedSteps,
        workflowData,
        setWorkflowData,
        goToStep,
        completeStep,
        resetWorkflow,
        getCurrentStepInfo,
        WORKFLOW_STEPS
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

// Hook to use workflow context
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RiskFormulaModal from './components/RiskFormulaModal';
import EAPReportModal from './components/EAPReportModal';
import SimulationResultModal from './components/SimulationResultModal';
import FloodAlertBanner from './components/FloodAlertBanner';

// Workflow Components
import { WorkflowProvider, useWorkflow } from './WorkflowContext';
import LandingScreen from './components/LandingScreen';
import WorkflowSidebar from './workflow/WorkflowSidebar';
import Step1StudyArea from './workflow/Step1StudyArea';
import Step2DataPreparation from './workflow/Step2DataPreparation';
import Step3BreachScenario from './workflow/Step3BreachScenario';
import Step4HydrodynamicModel from './workflow/Step4HydrodynamicModel';
import Step5FloodSimulation from './workflow/Step5FloodSimulation';
import Step6ImpactAndRisk from './workflow/Step6ImpactAndRisk';
import Step7Evacuation from './workflow/Step7Evacuation';
import Step8ResultsAndReport from './workflow/Step8ResultsAndReport';

// Analysis Mode Pages
import CommandOverviewDashboard from './pages/CommandOverviewDashboard';
import EnhancedRiskVulnerabilityDashboard from './pages/EnhancedRiskVulnerabilityDashboard';
import EnhancedEvacuationDashboard from './pages/EnhancedEvacuationDashboard';
import DashboardPage from './pages/DashboardPage';
import VillageRiskPage from './pages/VillageRiskPage';
import EvacuationPage from './pages/EvacuationPage';
import ModelComparePage from './pages/ModelComparePage';
import AIModelPage from './pages/AIModelPage';
import ValidationPage from './pages/ValidationPage';

import {
  fetchDams,
  fetchDamDetail,
  fetchScenarios,
  runSimulation,
  fetchSimulationTimestep,
  fetchMaxExtent,
  fetchCrossSections,
  fetchVillagesRisk,
  fetchInfrastructureRisk,
  fetchRoadsStatus,
  fetchShelters,
  calculateEvacuationRoute
} from './services/api';

function AppContent() {
  // Get workflow state from context
  const { currentStep, goToStep, resetWorkflow, completedSteps, completeStep } = useWorkflow();
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [appMode, setAppMode] = useState('landing'); // 'landing' | 'workflow' | 'analysis'
  const [activeTab, setActiveTab] = useState('dashboard'); // for analysis mode
  const [isEAPReportOpen, setIsEAPReportOpen] = useState(false);
  const [isSimResultOpen, setIsSimResultOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Flood Alert Notifications
  const [floodAlerts, setFloodAlerts] = useState([]);

  // Core Data State
  const [dams, setDams] = useState([]);
  const [activeDam, setActiveDam] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentSimulation, setCurrentSimulation] = useState(null);

  // Hydrodynamic Simulation Time Progression
  const [currentTimeMin, setCurrentTimeMin] = useState(30);
  const [timeStepData, setTimeStepData] = useState(null);
  const [maxExtent, setMaxExtent] = useState(null);
  const [crossSections, setCrossSections] = useState([]);

  // Spatial & GIS State
  const [riverGeojson, setRiverGeojson] = useState(null);
  const [villagesRisk, setVillagesRisk] = useState([]);
  const [infrastructureRisk, setInfrastructureRisk] = useState([]);
  const [roadsStatus, setRoadsStatus] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [evacuationRoute, setEvacuationRoute] = useState(null);
  const [selectedVillageForEvac, setSelectedVillageForEvac] = useState(null);

  // Generate time-based flood alerts when time slider changes
  useEffect(() => {
    if (!currentSimulation || !villagesRisk.length) return;

    const alerts = [];

    // Alert when first critical village is about to be hit
    const criticalVillages = villagesRisk.filter(v => v.risk_level === 'CRITICAL');
    criticalVillages.forEach((v) => {
      const arrivalMin = v.flood_arrival_time_min || 999;
      if (currentTimeMin >= arrivalMin - 5 && currentTimeMin <= arrivalMin + 5) {
        alerts.push({
          id: `crit-${v.id}-${currentTimeMin}`,
          type: 'CRITICAL',
          title: 'Flood Wave Imminent',
          message: `${v.name} (Pop: ${v.population.toLocaleString()}) — Flood front arriving now. IMMEDIATE evacuation required.`,
          time_min: currentTimeMin,
        });
      }
    });

    // Alert at T=0 when simulation just started
    if (currentTimeMin <= 5 && currentSimulation) {
      alerts.push({
        id: `breach-start-${currentSimulation.simulation_id}`,
        type: 'CRITICAL',
        title: 'Dam Breach Initiated',
        message: `Peak outflow of ${currentSimulation.peak_breach_discharge_cumecs?.toLocaleString()} m³/s projected. Emergency protocols activated.`,
        time_min: 0,
      });
    }

    // Alert at peak zone (around T=30 typically)
    if (currentTimeMin >= 25 && currentTimeMin <= 35) {
      alerts.push({
        id: `peak-wave-${currentTimeMin}`,
        type: 'HIGH',
        title: 'Peak Surge Propagating',
        message: `Maximum hydraulic head downstream. Check cutoff roads and confirm shelter arrivals.`,
        time_min: currentTimeMin,
      });
    }

    if (alerts.length > 0) {
      setFloodAlerts(alerts);
    }
  }, [currentTimeMin, villagesRisk, currentSimulation]);

  // 1. Initial Data Fetch when the user actually starts the workflow
  useEffect(() => {
    if (appMode === 'landing') return;

    const initializeApp = async () => {
      setIsLoading(true);
      try {
        const [damsList, scenarioList] = await Promise.all([
          fetchDams(),
          fetchScenarios()
        ]);
        setDams(damsList);
        setScenarios(scenarioList);

        if (damsList.length > 0) {
          const defaultDamId = damsList[0].id;
          const damDetail = await fetchDamDetail(defaultDamId);
          setActiveDam(damDetail);

          const simRes = await runSimulation({
            dam_id: defaultDamId,
            scenario_type: 'medium',
            simulation_duration_min: 180,
            time_step_min: 5,
            model_type: 'demo'
          });
          setCurrentSimulation(simRes);
        }
      } catch (err) {
        console.error('Failed to initialize app state:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, [appMode]);

  // 2. Load Simulation Context & GIS Layers when Dam or Simulation changes
  useEffect(() => {
    if (!activeDam || !currentSimulation) return;

    const loadSimContext = async () => {
      try {
        const simId = currentSimulation.simulation_id;
        const damId = activeDam.id;

        const [extent, xs, villages, infras, roads, shelterList] = await Promise.all([
          fetchMaxExtent(simId),
          fetchCrossSections(simId),
          fetchVillagesRisk(damId, simId),
          fetchInfrastructureRisk(damId, simId),
          fetchRoadsStatus(damId, simId),
          fetchShelters(damId)
        ]);

        setMaxExtent(extent);
        setCrossSections(xs);
        setVillagesRisk(villages);
        setInfrastructureRisk(infras);
        setRoadsStatus(roads);
        setShelters(shelterList);

        if (activeDam.river_points) {
          setRiverGeojson({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: { name: activeDam.river },
              geometry: { type: 'LineString', coordinates: activeDam.river_points }
            }]
          });
        }
      } catch (err) {
        console.error('Error loading simulation context:', err);
      }
    };
    loadSimContext();
  }, [activeDam, currentSimulation]);

  // 3. Load Timestep Snapshot when currentTimeMin or simulation changes
  useEffect(() => {
    if (!currentSimulation) return;

    const loadTimestep = async () => {
      try {
        const tsData = await fetchSimulationTimestep(
          currentSimulation.simulation_id,
          currentTimeMin
        );
        setTimeStepData(tsData);
      } catch (err) {
        console.error('Failed to load timestep:', err);
      }
    };
    loadTimestep();
  }, [currentSimulation, currentTimeMin]);

  // Handle Dam Selection
  const handleSelectDam = async (damId) => {
    setIsLoading(true);
    try {
      const damDetail = await fetchDamDetail(damId);
      setActiveDam(damDetail);
      const simRes = await runSimulation({
        dam_id: damId,
        scenario_type: 'medium',
        simulation_duration_min: 180,
        time_step_min: 5,
        model_type: 'demo'
      });
      setCurrentSimulation(simRes);
      setCurrentTimeMin(30);
      setEvacuationRoute(null);
      setFloodAlerts([]);
    } catch (err) {
      console.error('Error switching dam:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Simulation Execution — shows result modal after completion
  const handleRunSimulation = async (params) => {
    setIsLoading(true);
    try {
      const simRes = await runSimulation(params);
      setCurrentSimulation(simRes);
      setCurrentTimeMin(0);
      setEvacuationRoute(null);
      setFloodAlerts([]);
      setIsSimResultOpen(true);
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Evacuation Routing
  const handleCalculateRoute = async (payload) => {
    try {
      const res = await calculateEvacuationRoute(
        payload,
        currentSimulation?.simulation_id
      );
      setEvacuationRoute(res);
    } catch (err) {
      console.error('Failed to calculate route:', err);
    }
  };

  // Quick Action: Navigate to evacuation tab and compute route for a village
  const handlePlanEvacuationForVillage = async (villageId) => {
    setSelectedVillageForEvac(villageId);
    setActiveTab('evacuation');
    await handleCalculateRoute({
      dam_id: activeDam?.id || 'dam-idukki',
      origin_village_id: villageId,
      time_of_evacuation_min: 0,
      evacuation_speed_kmh: 25.0
    });
  };

  const handleStartAnalysis = () => {
    setShowLanding(false);
    setAppMode('workflow');
    resetWorkflow();
    goToStep(1);
  };

  const handleNewAnalysis = () => {
    setShowLanding(true);
    setAppMode('landing');
    setActiveTab('dashboard');
    resetWorkflow();
  };

  // Switch to analysis mode (after workflow completion or manual navigation)
  const switchToAnalysisMode = (tabId = 'dashboard') => {
    setAppMode('analysis');
    setActiveTab(tabId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans select-none">

      {appMode !== 'landing' && (
        <>
          {/* Top Header Navigation */}
          <Header
            activeTab={activeTab}
            setActiveTab={(tabId) => switchToAnalysisMode(tabId)}
            activeDam={activeDam}
            currentSimulation={currentSimulation}
            onOpenMethodology={() => setIsMethodologyOpen(true)}
            onOpenEAPReport={() => setIsEAPReportOpen(true)}
          />

          {/* Floating Flood Alert Notifications */}
          <FloodAlertBanner alerts={floodAlerts} />
        </>
      )}

      {/* WORKFLOW MODE */}
      {appMode === 'workflow' && (
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar - Workflow Progress */}
          <WorkflowSidebar currentStep={currentStep} />

          {/* Main Content Area - Workflow Steps */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {currentStep === 1 && (
              <Step1StudyArea 
                onDamSelected={handleSelectDam}
              />
            )}

          {currentStep === 2 && (
            <Step2DataPreparation 
              damId={activeDam?.id}
            />
          )}

          {currentStep === 3 && (
            <Step3BreachScenario
              damId={activeDam?.id}
            />
          )}

          {currentStep === 4 && (
            <Step4HydrodynamicModel
              damId={activeDam?.id}
              scenarioParams={{}}
              onSimulationReady={(result) => {
                setCurrentSimulation(result);
                setCurrentTimeMin(0);
              }}
            />
          )}

          {currentStep === 5 && (
            <Step5FloodSimulation
              simulation={currentSimulation}
              currentTimeMin={currentTimeMin}
              onTimeChange={setCurrentTimeMin}
              timeStepData={timeStepData}
              maxExtent={maxExtent}
              riverGeojson={riverGeojson}
              villagesRisk={villagesRisk}
              infrastructureRisk={infrastructureRisk}
              roadsStatus={roadsStatus}
              shelters={shelters}
              evacuationRoute={evacuationRoute}
              onSelectVillage={() => {}}
              crossSections={crossSections}
            />
          )}

          {currentStep === 6 && (
            <Step6ImpactAndRisk
              villagesRisk={villagesRisk}
              infrastructureRisk={infrastructureRisk}
              roadsStatus={roadsStatus}
              simulation={currentSimulation}
              onSelectVillage={() => {}}
            />
          )}

          {currentStep === 7 && (
            <Step7Evacuation
              villagesRisk={villagesRisk}
              shelters={shelters}
              roadsStatus={roadsStatus}
              simulation={currentSimulation}
              timeStepData={timeStepData}
              maxExtent={maxExtent}
              riverGeojson={riverGeojson}
              infrastructureRisk={infrastructureRisk}
              onSelectVillage={() => {}}
              onPlanEvacuation={() => {}}
            />
          )}

            {currentStep === 8 && (
              <Step8ResultsAndReport
                simulation={currentSimulation}
                villagesRisk={villagesRisk}
                infrastructureRisk={infrastructureRisk}
                maxExtent={maxExtent}
                evacuationRoute={evacuationRoute}
                onStartNewAnalysis={handleNewAnalysis}
              />
            )}
          </div>
        </div>
      )}

      {/* ANALYSIS MODE */}
      {appMode === 'analysis' && (
        <>
          {activeTab === 'dashboard' && (
            <CommandOverviewDashboard
              activeDam={activeDam}
              currentSimulation={currentSimulation}
              maxExtent={maxExtent}
              villagesRisk={villagesRisk}
              infrastructureRisk={infrastructureRisk}
              roadsStatus={roadsStatus}
              shelters={shelters}
              timeStepData={timeStepData}
              riverGeojson={riverGeojson}
              currentTimeMin={currentTimeMin}
              onTimeChange={setCurrentTimeMin}
              crossSections={crossSections}
              onSelectVillage={() => {}}
            />
          )}

          {activeTab === 'villages' && (
            <EnhancedRiskVulnerabilityDashboard
              villagesRisk={villagesRisk}
              infrastructureRisk={infrastructureRisk}
              activeDam={activeDam}
            />
          )}

          {activeTab === 'evacuation' && (
            <EnhancedEvacuationDashboard
              villagesRisk={villagesRisk}
              shelters={shelters}
              roadsStatus={roadsStatus}
              simulation={currentSimulation}
              timeStepData={timeStepData}
              maxExtent={maxExtent}
              riverGeojson={riverGeojson}
              infrastructureRisk={infrastructureRisk}
              activeDam={activeDam}
              currentTimeMin={currentTimeMin}
              onTimeChange={setCurrentTimeMin}
              onSelectVillage={setSelectedVillageForEvac}
            />
          )}

          {activeTab === 'compare' && (
            <ModelComparePage
              activeDam={activeDam}
            />
          )}

          {activeTab === 'ai' && (
            <AIModelPage
              activeDam={activeDam}
              currentSimulation={currentSimulation}
            />
          )}

          {activeTab === 'validation' && (
            <ValidationPage
              activeDam={activeDam}
              currentSimulation={currentSimulation}
            />
          )}
        </>
      )}

      {showLanding && (
        <LandingScreen onStart={handleStartAnalysis} />
      )}

      {/* --- Modals --- */}
      <RiskFormulaModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <EAPReportModal
        isOpen={isEAPReportOpen}
        onClose={() => setIsEAPReportOpen(false)}
        activeDam={activeDam}
        currentSimulation={currentSimulation}
        villagesRisk={villagesRisk}
        infrastructureRisk={infrastructureRisk}
        roadsStatus={roadsStatus}
        shelters={shelters}
      />

      <SimulationResultModal
        isOpen={isSimResultOpen}
        onClose={() => setIsSimResultOpen(false)}
        simulation={currentSimulation}
        villagesRisk={villagesRisk}
      />

    </div>
  );
}

// Export App wrapped with Workflow Provider
export default function App() {
  return (
    <WorkflowProvider>
      <AppContent />
    </WorkflowProvider>
  );
}

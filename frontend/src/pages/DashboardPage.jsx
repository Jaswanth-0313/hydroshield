import React from 'react';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import BottomPanel from '../components/BottomPanel';
import InundationMap from '../maps/InundationMap';

export default function DashboardPage({
  dams,
  activeDam,
  onSelectDam,
  scenarios,
  onRunSimulation,
  isLoading,
  currentSimulation,
  currentTimeMin,
  onTimeChange,
  timeStepData,
  maxExtent,
  riverGeojson,
  villagesRisk,
  infrastructureRisk,
  roadsStatus,
  shelters,
  evacuationRoute,
  crossSections,
  onSelectVillage,
  onPlanEvacuation,
  onNavigateToTab
}) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-88px)] overflow-hidden">
      
      {/* Middle Layout: Left Sidebar + Center Map + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Control Sidebar */}
        <LeftSidebar
          dams={dams}
          activeDam={activeDam}
          onSelectDam={onSelectDam}
          scenarios={scenarios}
          onRunSimulation={onRunSimulation}
          isLoading={isLoading}
        />

        {/* Center GIS Inundation Map */}
        <main className="flex-1 h-full relative">
          <InundationMap
            activeDam={activeDam}
            timeStepData={timeStepData}
            maxExtent={maxExtent}
            riverGeojson={riverGeojson}
            villagesRisk={villagesRisk}
            infrastructureRisk={infrastructureRisk}
            roadsGeojson={roadsStatus}
            shelters={shelters}
            evacuationRoute={evacuationRoute}
            onSelectVillage={onSelectVillage}
            onPlanEvacuation={onPlanEvacuation}
          />
        </main>

        {/* Right Telemetry Sidebar */}
        <RightSidebar
          currentSimulation={currentSimulation}
          villagesRisk={villagesRisk}
          infrastructureRisk={infrastructureRisk}
          roadsStatus={roadsStatus}
          onSelectVillage={onSelectVillage}
          onNavigateToTab={onNavigateToTab}
        />

      </div>

      {/* Bottom Timeline & Hydrograph Panel */}
      <BottomPanel
        currentTimeMin={currentTimeMin}
        onTimeChange={onTimeChange}
        durationMin={currentSimulation?.duration_min || 180}
        crossSections={crossSections}
      />

    </div>
  );
}

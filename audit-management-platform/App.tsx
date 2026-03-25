
import React, { useState } from 'react';
import type { RACM, Engagement, EngagementControl, EngagementStatus } from './types';
import Header from './components/Header';
import RACMListPage from './components/RACMListPage';
import RACMBuilderPage from './components/RACMBuilderPage';
import EngagementListPage from './components/EngagementListPage';
import EngagementWorkspacePage from './components/EngagementWorkspacePage';
import TestingWorkspacePage from './components/TestingWorkspacePage';
import ReviewerWorkspacePage from './components/ReviewerWorkspacePage';
import { engagementData, engagementControlsData, racmData } from './constants';
// TEMP_DEMO_AMAZON_TRANSPORT: hardcoded CEO demo data
import { documentDataAmazonEngagement, documentDataAmazonControls, documentDataAmazonRacm } from './demoAmazonTransport';

export type Page = 'racm' | 'engagements';

const calculateEngagementStatus = (controlsForEngagement: EngagementControl[]): EngagementStatus => {
  if (!controlsForEngagement || controlsForEngagement.length === 0) {
    return 'NOT STARTED';
  }

  // All concluded → CLOSED
  if (controlsForEngagement.every(c => c.status === 'Concluded')) {
    return 'CLOSED';
  }
  // Any under review → UNDER REVIEW
  if (controlsForEngagement.some(c => c.status === 'Pending Review')) {
    return 'UNDER REVIEW';
  }
  // Any in active testing or evidence collection → IN PROGRESS
  if (controlsForEngagement.some(c => c.status === 'Testing In Progress' || c.status === 'Evidence Collection')) {
    return 'IN PROGRESS';
  }
  // Mix of Concluded and Not Started → IN PROGRESS (some work done)
  if (controlsForEngagement.some(c => c.status === 'Concluded')) {
    return 'IN PROGRESS';
  }
  
  return 'NOT STARTED'; // All must be 'Not Started'
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('racm');
  const [selectedRACM, setSelectedRACM] = useState<RACM | null>(null);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [selectedControlForTesting, setSelectedControlForTesting] = useState<EngagementControl | null>(null);
  const [selectedControlForReview, setSelectedControlForReview] = useState<EngagementControl | null>(null);
  
  // TEMP_DEMO_AMAZON_TRANSPORT: inject into list
  const [engagements, setEngagements] = useState<Engagement[]>([documentDataAmazonEngagement, ...engagementData]);
  const [controls, setControls] = useState<EngagementControl[]>([...documentDataAmazonControls, ...engagementControlsData]);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    // Reset selections to ensure navigation to top-level list pages
    setSelectedRACM(null);
    setSelectedEngagement(null);
    setSelectedControlForTesting(null);
    setSelectedControlForReview(null);
  };

  const handleViewRACM = (racm: RACM) => {
    setSelectedRACM(racm);
  };

  const handleReturnToList = () => {
    setSelectedRACM(null);
  };
  
  const handleSelectEngagement = (engagement: Engagement) => {
    setSelectedEngagement(engagement);
  };
  
  const handleReturnToEngagementList = () => {
    setSelectedEngagement(null);
  };
  
  const handlePerformTesting = (control: EngagementControl) => {
    // Transition engagement status if it's in PLANNING or NOT STARTED (for new demo engagements)
    if (selectedEngagement && (selectedEngagement.status === 'PLANNING' || selectedEngagement.status === 'NOT STARTED')) {
      const updatedEngagement = { ...selectedEngagement, status: 'IN PROGRESS' as const };
      setSelectedEngagement(updatedEngagement);
      setEngagements(prev => prev.map(e => e.id === updatedEngagement.id ? updatedEngagement : e));
    }
    setSelectedControlForTesting(control);
  };

  const handleReviewControl = (control: EngagementControl) => {
    setSelectedControlForReview(control);
  };

  const handleExitTesting = (updatedControl?: EngagementControl) => {
    let finalControls = controls;
    if (updatedControl) {
      finalControls = controls.map(c => c.id === updatedControl.id ? updatedControl : c);
      setControls(finalControls);
    }
    
    if (selectedEngagement) {
      // TEMP_DEMO_AMAZON_TRANSPORT: debug log as requested
      console.log("DEMO CHECK", selectedEngagement.linkedRacmName);
      
      // TEMP_DEMO_AMAZON_TRANSPORT: inject demo controls when RACM = AMZ TRANSPORT
      const linkedRacm = selectedEngagement.linkedRacmName || "";
      const isAmzTransport = linkedRacm.toUpperCase().includes('TRANSPORT') || linkedRacm.toUpperCase().includes('AMZ TRANSPORT');
      const isAmz = linkedRacm.toUpperCase().includes('AMZ') && !isAmzTransport;

      const engagementControls = finalControls.filter(c => {
        if (isAmzTransport) return c.controlId.startsWith('ATC-');
        if (isAmz) return c.controlId.startsWith('C-');
        return c.controlId.startsWith('ITGC-');
      });
      
      // Recalculate engagement summary data based on the latest controls state
      const newDeficiencies = engagementControls.filter(c => c.conclusion === 'Ineffective').length;
      const newStatus = calculateEngagementStatus(engagementControls);
      
      const updatedEngagement = {
        ...selectedEngagement,
        totalDeficiencies: newDeficiencies,
        status: newStatus,
      };
      
      setSelectedEngagement(updatedEngagement);
      
      setEngagements(prevEngagements => 
        prevEngagements.map(e => e.id === updatedEngagement.id ? updatedEngagement : e)
      );
    }

    setSelectedControlForTesting(null);
  };
  
  const handleExitReview = (updatedControl: EngagementControl, deficiencyCreated: boolean) => {
    const finalControls = controls.map(c => c.id === updatedControl.id ? updatedControl : c);
    setControls(finalControls);
    
    if (selectedEngagement) {
      // TEMP_DEMO_AMAZON_TRANSPORT: debug log as requested
      console.log("DEMO CHECK", selectedEngagement.linkedRacmName);

      // TEMP_DEMO_AMAZON_TRANSPORT: inject demo controls when RACM = AMZ TRANSPORT
      const linkedRacm = selectedEngagement.linkedRacmName || "";
      const isAmzTransport = linkedRacm.toUpperCase().includes('TRANSPORT') || linkedRacm.toUpperCase().includes('AMZ TRANSPORT');
      const isAmz = linkedRacm.toUpperCase().includes('AMZ') && !isAmzTransport;

      const engagementControls = finalControls.filter(c => {
        if (isAmzTransport) return c.controlId.startsWith('ATC-');
        if (isAmz) return c.controlId.startsWith('C-');
        return c.controlId.startsWith('ITGC-');
      });
      
      const engagementDeficiencies = engagementControls.filter(c => c.conclusion === 'Ineffective').length;
      const newStatus = calculateEngagementStatus(engagementControls);
      
      const updatedEngagement = {
          ...selectedEngagement,
          totalDeficiencies: engagementDeficiencies,
          status: newStatus,
      };
      
      setSelectedEngagement(updatedEngagement);
       setEngagements(prevEngagements => 
        prevEngagements.map(e => e.id === updatedEngagement.id ? updatedEngagement : e)
      );
    }

    setSelectedControlForReview(null);
  }

  const renderPage = () => {
    if (selectedControlForReview && selectedEngagement) {
      return <ReviewerWorkspacePage 
                control={selectedControlForReview}
                engagement={selectedEngagement}
                onExit={handleExitReview}
              />;
    }

    if (selectedControlForTesting && selectedEngagement) {
      return <TestingWorkspacePage 
                control={selectedControlForTesting} 
                engagement={selectedEngagement} 
                onExit={handleExitTesting} 
             />;
    }

    if (currentPage === 'engagements') {
      if (selectedEngagement) {
        const handleCloseEngagement = () => {
          const updatedEngagement = { ...selectedEngagement, status: 'CLOSED' as const };
          setSelectedEngagement(updatedEngagement);
          setEngagements(prev => prev.map(e => e.id === updatedEngagement.id ? updatedEngagement : e));
        };
        // TEMP_DEMO_AMAZON_TRANSPORT: debug log as requested
        console.log("DEMO CHECK", selectedEngagement.linkedRacmName);

        // TEMP_DEMO_AMAZON_TRANSPORT: inject demo controls when RACM = AMZ TRANSPORT
        const linkedRacm = selectedEngagement.linkedRacmName || "";
        const isAmzTransport = linkedRacm.toUpperCase().includes('TRANSPORT') || linkedRacm.toUpperCase().includes('AMZ TRANSPORT');
        const isAmz = linkedRacm.toUpperCase().includes('AMZ') && !isAmzTransport;

        const filteredControls = controls.filter(c => {
          if (isAmzTransport) return c.controlId.startsWith('ATC-');
          if (isAmz) return c.controlId.startsWith('C-');
          return c.controlId.startsWith('ITGC-');
        });
        return <EngagementWorkspacePage 
                  engagement={selectedEngagement}
                  controls={filteredControls}
                  onBack={handleReturnToEngagementList} 
                  onPerformTesting={handlePerformTesting}
                  onReviewControl={handleReviewControl}
                  onCloseEngagement={handleCloseEngagement}
               />;
      }
      return <EngagementListPage 
                engagements={engagements}
                setEngagements={setEngagements}
                controls={controls}
                setControls={setControls}
                // TEMP_DEMO_AMAZON_TRANSPORT: only allow selecting AMZ TRANSPORT during demo
                racms={[documentDataAmazonRacm]}
                onSelectEngagement={handleSelectEngagement} 
             />;
    }
    
    // Default to RACM page logic
    if (selectedRACM) {
      return <RACMBuilderPage racm={selectedRACM} onBack={handleReturnToList} />;
    }
    return <RACMListPage onSelectRACM={handleViewRACM} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <Header currentPage={currentPage} setCurrentPage={handlePageChange} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-screen-2xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
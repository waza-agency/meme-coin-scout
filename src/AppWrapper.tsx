import { useState } from 'react';
import LandingPage from './components/LandingPage';
import FeatureDetail from './components/landing/FeatureDetail';
import App from './App';

type ViewMode = 'landing' | 'app' | 'feature-detail';

function AppWrapper() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const handleGetStarted = () => {
    setViewMode('app');
  };

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId);
    setViewMode('feature-detail');
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
    setSelectedFeature('');
  };

  if (viewMode === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} onFeatureClick={handleFeatureClick} />;
  }

  if (viewMode === 'feature-detail') {
    return <FeatureDetail featureId={selectedFeature} onBack={handleBackToLanding} />;
  }

  return (
    <div>
      {/* Back to Landing button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBackToLanding}
          className="px-4 py-2 bg-crypto-gray border border-crypto-light-gray rounded-lg text-sm text-gray-400 hover:text-white hover:border-crypto-accent transition-all duration-300"
          id="app-back-to-landing-001"
        >
          ← Back to Home
        </button>
      </div>
      <App />
    </div>
  );
}

export default AppWrapper;

import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Shield, BarChart3, Rocket, ChevronRight, Sparkles } from 'lucide-react';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';

interface LandingPageProps {
  onGetStarted: () => void;
  onFeatureClick?: (featureId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onFeatureClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-crypto-dark overflow-hidden">
      <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <HeroSection onGetStarted={onGetStarted} />
        <FeaturesSection onFeatureClick={onFeatureClick} />
        <CTASection onGetStarted={onGetStarted} />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;

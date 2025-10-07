import { useState } from 'react';
import { TrendingUp, Zap, Shield, BarChart3, Filter, Globe } from 'lucide-react';

interface FeaturesSectionProps {
  onFeatureClick?: (featureId: string) => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onFeatureClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      id: 'lightning-fast-analysis',
      icon: Zap,
      title: 'Lightning Fast Analysis',
      description: 'Analyze any token contract instantly. Get critical metrics in seconds, not hours.',
      gradient: 'from-crypto-yellow to-crypto-accent',
    },
    {
      id: 'advanced-filtering',
      icon: BarChart3,
      title: 'Advanced Filtering',
      description: 'Filter by market cap, liquidity, age, and more. Find exactly what you\'re looking for.',
      gradient: 'from-crypto-blue to-crypto-accent',
    },
    {
      id: 'multi-chain-support',
      icon: Globe,
      title: 'Multi-Chain Support',
      description: 'Screen tokens across Solana, Ethereum, Base, BSC, and more blockchains.',
      gradient: 'from-crypto-accent to-crypto-green',
    },
    {
      id: 'real-time-data',
      icon: TrendingUp,
      title: 'Real-Time Data',
      description: 'Live market data updates every minute. Never miss a golden opportunity.',
      gradient: 'from-crypto-green to-crypto-accent',
    },
    {
      id: 'risk-assessment',
      icon: Shield,
      title: 'Risk Assessment',
      description: 'Evaluate token safety with comprehensive on-chain metrics and liquidity analysis.',
      gradient: 'from-crypto-red to-crypto-yellow',
    },
    {
      id: 'smart-screener',
      icon: Filter,
      title: 'Smart Screener',
      description: 'Discover hidden gems with customizable criteria. Save time, find winners.',
      gradient: 'from-crypto-accent to-crypto-blue',
    },
  ];

  return (
    <section id="features-section" className="relative py-24 px-4 bg-crypto-gray">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-crypto-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-crypto-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-crypto-accent/10 border border-crypto-accent/20 rounded-full text-crypto-accent text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-crypto-accent to-crypto-blue bg-clip-text text-transparent">
              Trade Smart
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Professional-grade tools designed for traders who demand the best
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onFeatureClick?.(feature.id)}
                className={`group relative p-6 bg-crypto-dark border border-crypto-light-gray rounded-xl transition-all duration-300 cursor-pointer ${
                  isHovered ? 'transform -translate-y-2 shadow-2xl' : 'shadow-lg'
                }`}
                id={`feature-card-${String(index + 1).padStart(3, '0')}`}
              >
                {/* Gradient border on hover */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                {/* Icon */}
                <div className="relative mb-4">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-r ${
                      feature.gradient
                    } p-[2px] ${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
                  >
                    <div className="w-full h-full bg-crypto-dark rounded-lg flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-crypto-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                {/* Hover indicator */}
                <div
                  className={`mt-4 flex items-center gap-2 text-crypto-accent font-medium text-sm ${
                    isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  } transition-all duration-300`}
                >
                  <span>Explore</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom decoration */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-crypto-dark/50 border border-crypto-accent/20 rounded-full">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-crypto-accent to-crypto-blue border-2 border-crypto-dark"
                ></div>
              ))}
            </div>
            <span className="text-gray-400 text-sm">
              Trusted by traders worldwide
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

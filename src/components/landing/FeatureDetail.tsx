import { ArrowLeft, Zap, BarChart3, Globe, TrendingUp, Shield, Filter, CheckCircle2 } from 'lucide-react';

interface FeatureDetailProps {
  featureId: string;
  onBack: () => void;
}

const featureDetails = {
  'lightning-fast-analysis': {
    icon: Zap,
    title: 'Lightning Fast Analysis',
    gradient: 'from-crypto-yellow to-crypto-accent',
    description: 'Analyze any token contract instantly with our advanced real-time analysis engine.',
    details: [
      'Get comprehensive token metrics in under 3 seconds',
      'Instant contract verification and security checks',
      'Real-time holder distribution analysis',
      'Quick access to liquidity pool information',
      'Fast transaction history scanning',
    ],
    benefits: [
      'Save hours of manual research time',
      'Make faster trading decisions',
      'Never miss time-sensitive opportunities',
      'Stay ahead of other traders',
    ],
    useCases: [
      'Quick token evaluation before buying',
      'Rapid due diligence on new projects',
      'Fast verification of contract safety',
      'Instant competitor analysis',
    ],
  },
  'advanced-filtering': {
    icon: BarChart3,
    title: 'Advanced Filtering',
    gradient: 'from-crypto-blue to-crypto-accent',
    description: 'Powerful filtering system to find exactly the tokens you\'re looking for.',
    details: [
      'Filter by market cap ranges (from micro to mega caps)',
      'Liquidity thresholds to avoid low-liquidity traps',
      'Token age filters to find new or established projects',
      'Holder count and distribution filters',
      'Custom price change filters (24h, 7d, 30d)',
    ],
    benefits: [
      'Find hidden gems before they explode',
      'Avoid risky or scam tokens',
      'Save time with precise search criteria',
      'Build custom screening strategies',
    ],
    useCases: [
      'Finding early-stage projects with potential',
      'Screening for blue-chip tokens only',
      'Discovering trending tokens in specific niches',
      'Building diversified portfolio candidates',
    ],
  },
  'multi-chain-support': {
    icon: Globe,
    title: 'Multi-Chain Support',
    gradient: 'from-crypto-accent to-crypto-green',
    description: 'Screen tokens across multiple blockchains from a single, unified interface.',
    details: [
      'Full support for Solana (SPL tokens)',
      'Ethereum mainnet and all EVM chains',
      'Base network integration',
      'Binance Smart Chain (BSC) support',
      'Regular addition of new blockchain networks',
    ],
    benefits: [
      'Access opportunities across all major chains',
      'No need for multiple tools or platforms',
      'Compare cross-chain projects easily',
      'Diversify across different ecosystems',
    ],
    useCases: [
      'Finding the best meme tokens regardless of chain',
      'Cross-chain arbitrage opportunities',
      'Diversifying portfolio across ecosystems',
      'Tracking multi-chain projects',
    ],
  },
  'real-time-data': {
    icon: TrendingUp,
    title: 'Real-Time Data',
    gradient: 'from-crypto-green to-crypto-accent',
    description: 'Live market data that updates every minute, keeping you informed of every opportunity.',
    details: [
      'Price updates every 60 seconds',
      'Live liquidity pool tracking',
      'Real-time holder count changes',
      'Instant volume and market cap updates',
      'Live transaction monitoring',
    ],
    benefits: [
      'Catch pumps as they happen',
      'Identify trending tokens immediately',
      'React to market changes in real-time',
      'Never miss a golden opportunity',
    ],
    useCases: [
      'Monitoring your watchlist for price action',
      'Detecting early pump signals',
      'Tracking liquidity additions/removals',
      'Spotting whale transactions',
    ],
  },
  'risk-assessment': {
    icon: Shield,
    title: 'Risk Assessment',
    gradient: 'from-crypto-red to-crypto-yellow',
    description: 'Comprehensive risk evaluation using on-chain metrics and liquidity analysis.',
    details: [
      'Contract security score and vulnerability checks',
      'Liquidity lock verification and time remaining',
      'Holder concentration and whale analysis',
      'Honeypot and rug pull detection',
      'Ownership renouncement verification',
    ],
    benefits: [
      'Protect your capital from scams',
      'Make informed risk-reward decisions',
      'Identify red flags before investing',
      'Sleep better knowing your tokens are safe',
    ],
    useCases: [
      'Pre-purchase security verification',
      'Ongoing portfolio risk monitoring',
      'Due diligence for large investments',
      'Identifying potential exit scams',
    ],
  },
  'smart-screener': {
    icon: Filter,
    title: 'Smart Screener',
    gradient: 'from-crypto-accent to-crypto-blue',
    description: 'Discover hidden gems with our intelligent, customizable screening engine.',
    details: [
      'Create custom screening criteria combinations',
      'Save your favorite screening strategies',
      'AI-powered sorting and recommendations',
      'Preset filters for common strategies',
      'Historical performance tracking',
    ],
    benefits: [
      'Find winners faster than competition',
      'Automate your research process',
      'Develop and refine winning strategies',
      'Maximize time efficiency',
    ],
    useCases: [
      'Finding 100x potential tokens',
      'Screening for safe, established projects',
      'Discovering trending micro-caps',
      'Building watchlists automatically',
    ],
  },
};

const FeatureDetail: React.FC<FeatureDetailProps> = ({ featureId, onBack }) => {
  const feature = featureDetails[featureId as keyof typeof featureDetails];

  if (!feature) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Feature not found</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-crypto-accent text-white rounded-lg hover:bg-crypto-accent-dark transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const Icon = feature.icon;

  return (
    <div className="min-h-screen bg-crypto-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-crypto-dark/95 backdrop-blur-lg border-b border-crypto-light-gray/30">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-crypto-accent transition-colors"
            id="feature-detail-back-001"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Features</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} p-[3px] mb-6`}
          >
            <div className="w-full h-full bg-crypto-dark rounded-2xl flex items-center justify-center">
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">{feature.title}</h1>
          <p className="text-xl text-gray-400 leading-relaxed">{feature.description}</p>
        </div>

        {/* Details Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
          <div className="space-y-3">
            {feature.details.map((detail, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-crypto-gray/50 rounded-lg border border-crypto-light-gray/20"
              >
                <CheckCircle2 className="w-6 h-6 text-crypto-accent flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Benefits</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {feature.benefits.map((benefit, index) => (
              <div
                key={index}
                className={`p-6 bg-gradient-to-br ${feature.gradient} bg-opacity-5 rounded-xl border border-crypto-accent/20`}
              >
                <p className="text-white font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Common Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {feature.useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-4 bg-crypto-gray rounded-lg border border-crypto-light-gray/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-300">{useCase}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gradient-to-br from-crypto-gray to-crypto-dark rounded-2xl border border-crypto-accent/20">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
          <p className="text-gray-400 mb-6">
            Start using {feature.title} and discover the next big opportunity.
          </p>
          <button
            onClick={onBack}
            className={`px-8 py-4 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
            id="feature-detail-cta-001"
          >
            Explore All Features
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetail;

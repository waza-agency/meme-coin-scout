import { useEffect, useState } from 'react';
import { TrendingUp, Sparkles, Rocket, Zap } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [chartProgress, setChartProgress] = useState(0);

  useEffect(() => {
    setIsLoaded(true);

    // Animate chart drawing
    const chartInterval = setInterval(() => {
      setChartProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 30);

    return () => {
      clearInterval(chartInterval);
    };
  }, []);

  // Chart path for "mooning" growth
  const chartPoints = [
    { x: 0, y: 80 },
    { x: 15, y: 75 },
    { x: 30, y: 65 },
    { x: 45, y: 55 },
    { x: 60, y: 35 },
    { x: 75, y: 15 },
    { x: 90, y: 5 },
    { x: 100, y: 0 },
  ];

  const chartPath = chartPoints
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-dark via-crypto-gray to-crypto-dark">
        <div className="absolute inset-0 bg-gradient-to-r from-crypto-accent/5 via-crypto-blue/5 to-crypto-accent/5 animate-pulse-slow"></div>
      </div>


      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,170,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,170,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Text content */}
        <div className="text-center lg:text-left">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 mb-8 bg-crypto-accent/10 border border-crypto-accent/20 rounded-full text-crypto-accent text-sm font-medium transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            id="landing-badge-001"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Discover the Next 100x Meme Token</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>

          {/* Main heading */}
          <h1
            className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-700 delay-100 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-white">Find </span>
            <span className="bg-gradient-to-r from-crypto-accent via-green-400 to-crypto-blue bg-clip-text text-transparent animate-gradient">
              Meme Tokens
            </span>
            <br />
            <span className="text-white">Before They </span>
            <span className="relative inline-flex items-center">
              <span className="text-crypto-accent glow-text">Moon</span>
              <Rocket className="w-10 h-10 md:w-14 md:h-14 ml-2 text-crypto-accent animate-bounce" />
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-xl md:text-2xl text-gray-400 mb-12 transition-all duration-700 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Analyze any token instantly or discover early-stage opportunities across multiple blockchains.
            Built for traders who want to stay ahead of the market.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 transition-all duration-700 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-gradient-to-r from-crypto-accent to-crypto-accent-dark rounded-lg font-semibold text-lg text-white shadow-lg shadow-crypto-accent/25 hover:shadow-xl hover:shadow-crypto-accent/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              id="landing-cta-primary-001"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Screening Now
                <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-crypto-accent-dark to-crypto-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button
              onClick={() => {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-crypto-gray border border-crypto-light-gray rounded-lg font-semibold text-lg text-white hover:border-crypto-accent/50 hover:bg-crypto-light-gray transition-all duration-300 hover:scale-105 active:scale-95"
              id="landing-cta-secondary-001"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right side - Animated Chart Visual */}
        <div
          className={`relative transition-all duration-1000 delay-400 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
          }`}
          id="hero-chart-visual-001"
        >
          <div className="relative bg-gradient-to-br from-crypto-gray/80 to-crypto-dark/80 backdrop-blur-xl rounded-3xl p-8 border border-crypto-accent/20 shadow-2xl shadow-crypto-accent/10">
            {/* Chart header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Your Portfolio</p>
                <h3 className="text-3xl font-bold text-white">+12,847%</h3>
              </div>
              <div className="px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <p className="text-green-400 font-bold text-lg">100x</p>
              </div>
            </div>

            {/* SVG Chart */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-64"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0, 212, 170, 0.3))' }}
            >
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.2"
                />
              ))}

              {/* Gradient for area under curve */}
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.0" />
                </linearGradient>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Area under the curve */}
              <path
                d={`${chartPath} L 100 100 L 0 100 Z`}
                fill="url(#chartGradient)"
                style={{
                  strokeDasharray: 200,
                  strokeDashoffset: 200 - (chartProgress * 2),
                  transition: 'stroke-dashoffset 0.5s ease-out',
                }}
              />

              {/* Main chart line */}
              <path
                d={chartPath}
                fill="none"
                stroke="#00D4AA"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#glow)"
                style={{
                  strokeDasharray: 200,
                  strokeDashoffset: 200 - (chartProgress * 2),
                  transition: 'stroke-dashoffset 0.5s ease-out',
                }}
              />

              {/* Animated dots on chart points */}
              {chartPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="1.5"
                  fill="#00D4AA"
                  className="animate-pulse"
                  style={{
                    opacity: chartProgress >= (i / chartPoints.length) * 100 ? 1 : 0,
                    transition: 'opacity 0.3s ease-out',
                  }}
                />
              ))}
            </svg>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-crypto-light-gray/30">
              <div>
                <p className="text-gray-500 text-xs mb-1">24h Volume</p>
                <p className="text-white font-semibold">$1.2M</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Market Cap</p>
                <p className="text-white font-semibold">$45M</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Holders</p>
                <p className="text-white font-semibold">12.5K</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-crypto-accent/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-crypto-accent rounded-full animate-pulse"></div>
        </div>
      </div>

      <style>{`
        .glow-text {
          text-shadow: 0 0 20px rgba(0, 212, 170, 0.5),
                       0 0 40px rgba(0, 212, 170, 0.3);
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

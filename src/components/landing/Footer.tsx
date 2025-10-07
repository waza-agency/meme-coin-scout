import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-crypto-dark to-black py-12 mt-20">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Main text with heart */}
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-sm md:text-base">Creado con</span>
            <Heart
              id="footer-heart-001"
              className="w-5 h-5 text-red-500 fill-red-500 animate-pulse"
              aria-label="amor"
            />
            <span className="text-sm md:text-base">por</span>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              WAZA
            </span>
          </div>

          {/* Tagline */}
          <div className="text-center">
            <p className="text-gray-400 text-sm md:text-base font-medium">
              We are{' '}
              <span className="text-purple-400 font-semibold">WAZA</span>
              {' '}and we are coding an easier world
            </p>
          </div>

          {/* Decorative elements */}
          <div className="flex gap-2 mt-4">
            <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse delay-100" />
            <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse delay-200" />
          </div>
        </div>
      </div>

      {/* Bottom gradient decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
    </footer>
  );
};

export default Footer;

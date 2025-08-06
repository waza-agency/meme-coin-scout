import React from 'react';
import { Coin, ViewMode } from '../types';
import CoinCard from './CoinCard';
import CoinCardCompact from './CoinCardCompact';
import CoinCardMedium from './CoinCardMedium';

interface CoinGridProps {
  coins: Coin[];
  viewMode: ViewMode;
}

const CoinGrid: React.FC<CoinGridProps> = ({ coins, viewMode }) => {
  const getGridClasses = () => {
    switch (viewMode) {
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3';
      case 'medium':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'detailed':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  };

  const renderCoinCard = (coin: Coin) => {
    switch (viewMode) {
      case 'compact':
        return <CoinCardCompact key={coin.pairAddress} coin={coin} />;
      case 'medium':
        return <CoinCardMedium key={coin.pairAddress} coin={coin} />;
      case 'detailed':
      default:
        return <CoinCard key={coin.pairAddress} coin={coin} />;
    }
  };

  return (
    <div className={getGridClasses()}>
      {coins.map(renderCoinCard)}
    </div>
  );
};

export default CoinGrid; 
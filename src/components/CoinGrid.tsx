import React from 'react';
import { Coin } from '../types';
import CoinCard from './CoinCard';

interface CoinGridProps {
  coins: Coin[];
}

const CoinGrid: React.FC<CoinGridProps> = ({ coins }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {coins.map((coin) => (
        <CoinCard key={coin.pairAddress} coin={coin} />
      ))}
    </div>
  );
};

export default CoinGrid; 
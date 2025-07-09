import React from 'react';
import { Blockchain, BlockchainConfig } from '../types';

interface BlockchainSelectorProps {
  selectedBlockchain: Blockchain;
  onBlockchainChange: (blockchain: Blockchain) => void;
  blockchains: Blockchain[];
  configs: Record<Blockchain, BlockchainConfig>;
}

const BlockchainSelector: React.FC<BlockchainSelectorProps> = ({
  selectedBlockchain,
  onBlockchainChange,
  blockchains,
  configs
}) => {
  return (
    <div className="bg-crypto-gray rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Select Blockchain</h3>
      <div className="space-y-2">
        {blockchains.map((blockchain) => (
          <button
            key={blockchain}
            onClick={() => onBlockchainChange(blockchain)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
              selectedBlockchain === blockchain
                ? 'bg-crypto-accent text-white'
                : 'bg-crypto-light-gray text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{configs[blockchain].displayName}</span>
              <span className="text-sm opacity-75">
                {configs[blockchain].quoteTokens.join(', ')}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlockchainSelector; 
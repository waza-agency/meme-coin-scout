import React, { useState } from 'react';
import { Heart, Copy, Check, X } from 'lucide-react';

interface DonationAddress {
  blockchain: string;
  symbol: string;
  address: string;
  color: string;
}

const DonationBanner: React.FC = () => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const donationAddresses: DonationAddress[] = [
    {
      blockchain: 'Solana',
      symbol: 'SOL',
      address: 'BckdmEsCLJt8rZjUbz3zfQkN42Za4B6KdMxxPYyGaQnM',
      color: 'from-purple-500 to-blue-500'
    },
    {
      blockchain: 'Ethereum',
      symbol: 'ETH',
      address: '0xae2B4003cf45f6b52b538169b399Be8949ab9FD1',
      color: 'from-blue-400 to-purple-600'
    },
    {
      blockchain: 'Sui',
      symbol: 'SUI',
      address: '0xbea11e2faf13275bdf58babe53e3ffeeb1f35f94170dc79ca13fcf02f41d20b9',
      color: 'from-cyan-400 to-blue-600'
    },
    {
      blockchain: 'Base',
      symbol: 'BASE',
      address: '0xae2B4003cf45f6b52b538169b399Be8949ab9FD1',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      blockchain: 'Bitcoin',
      symbol: 'BTC',
      address: 'bc1pdau650ynw4rjpepsgw3daqlvu5fnjhkl2pru7pudn596htepvcwqux9xyz',
      color: 'from-orange-400 to-yellow-500'
    }
  ];

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(null), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy address: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-crypto-accent/10 to-purple-600/10 border border-crypto-accent/20 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-crypto-accent animate-pulse" />
          <h3 className="text-lg font-semibold text-white">Support MemeScreener Development</h3>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-gray-300 text-sm mb-4">
        Love using MemeScreener? Help us keep the service free and improve the platform! 
        Your donations directly support development, API costs, and new features.
      </p>

      <div className="space-y-2">
        <div className="text-sm text-gray-400 mb-2">Donate with your preferred cryptocurrency:</div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
          {donationAddresses.map((donation) => (
            <div
              key={donation.blockchain}
              className="bg-crypto-gray border border-gray-700 rounded-lg p-3 hover:border-crypto-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${donation.color}`} />
                <div className="flex items-center gap-1">
                  <span className="text-white font-medium text-sm">{donation.symbol}</span>
                  <span className="text-gray-400 text-xs">({donation.blockchain})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-300 flex-1">
                  {truncateAddress(donation.address)}
                </span>
                <button
                  onClick={() => copyToClipboard(donation.address)}
                  className="p-1 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                  title={`Copy ${donation.blockchain} address`}
                >
                  {copiedAddress === donation.address ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-gray-400">
            Every donation helps us maintain and improve MemeScreener for the community
          </div>
          <div className="flex items-center gap-1 text-xs text-crypto-accent">
            <Heart className="w-3 h-3" />
            <span>Thank you for your support!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationBanner;
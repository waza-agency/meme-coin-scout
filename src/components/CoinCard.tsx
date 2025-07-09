import React, { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, TrendingDown, Copy, Check } from 'lucide-react';
import { Coin } from '../types';
import { formatMarketCap, formatAge, calculateAge, getTokenImageUrl } from '../utils/filters';
import { calculateLiquidityIndicator, calculateRiskIndicator, calculateSocialMentionsIndicator, calculateWhaleActivityIndicator } from '../utils/indicators';
import { rugCheckService, RugCheckRiskData } from '../services/rugcheck';
import { socialMentionsService } from '../services/social-mentions';
import { whaleActivityService } from '../services/whale-activity';
import { technicalAnalysisService } from '../services/technical-analysis';
import { holderAnalysisService } from '../services/holder-analysis';
import { SocialMentionsData, WhaleActivityData, TechnicalData } from '../types';
import { HolderAnalysisData } from '../services/holder-analysis';
import LiquidityIndicator from './LiquidityIndicator';
import RiskIndicator from './RiskIndicator';
import SocialMentionsIndicator from './SocialMentionsIndicator';
import WhaleActivityIndicator from './WhaleActivityIndicator';
import { TechnicalAnalysisIndicator } from './TechnicalAnalysisIndicator';
import { HolderAnalysisIndicator } from './HolderAnalysisIndicator';
import RugCheckModal from './RugCheckModal';

interface CoinCardProps {
  coin: Coin;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin }) => {
  const [rugCheckData, setRugCheckData] = useState<RugCheckRiskData | null>(null);
  const [rugCheckLoading, setRugCheckLoading] = useState(false);
  const [socialMentionsData, setSocialMentionsData] = useState<SocialMentionsData | null>(null);
  const [socialMentionsLoading, setSocialMentionsLoading] = useState(false);
  const [whaleActivityData, setWhaleActivityData] = useState<WhaleActivityData | null>(null);
  const [whaleActivityLoading, setWhaleActivityLoading] = useState(false);
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null);
  const [holderData, setHolderData] = useState<HolderAnalysisData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRugCheckModalOpen, setIsRugCheckModalOpen] = useState(false);
  
  const marketCap = coin.marketCap || coin.fdv;
  const age = calculateAge(coin.pairCreatedAt);
  const imageUrl = getTokenImageUrl(coin);
  const priceChange = coin.priceChange?.h24;
  const dexScreenerUrl = `https://dexscreener.com/${coin.chainId || coin.dexId}/${coin.pairAddress}`;
  const contractAddress = coin.baseToken.address;
  
  // Fetch rugcheck data on mount (only for Solana tokens)
  useEffect(() => {
    const fetchRugCheckData = async () => {
      if (coin.chainId !== 'solana' && coin.dexId?.toLowerCase() !== 'solana') {
        return; // Rugcheck.xyz is primarily for Solana tokens
      }
      
      setRugCheckLoading(true);
      try {
        const data = await rugCheckService.getTokenRisk(contractAddress);
        setRugCheckData(data);
      } catch (error) {
        console.warn('Failed to fetch rugcheck data:', error);
      } finally {
        setRugCheckLoading(false);
      }
    };
    
    fetchRugCheckData();
  }, [contractAddress, coin.chainId, coin.dexId]);

  // Fetch social mentions data on mount
  useEffect(() => {
    const fetchSocialMentionsData = async () => {
      setSocialMentionsLoading(true);
      try {
        // Use token symbol as the search query
        const searchQuery = coin.baseToken.symbol;
        const data = await socialMentionsService.searchMentions(searchQuery, '24h');
        setSocialMentionsData(data);
      } catch (error) {
        console.warn('Failed to fetch social mentions data:', error);
      } finally {
        setSocialMentionsLoading(false);
      }
    };
    
    fetchSocialMentionsData();
  }, [coin.baseToken.symbol]);

  // Fetch whale activity data on mount
  useEffect(() => {
    const fetchWhaleActivityData = async () => {
      setWhaleActivityLoading(true);
      try {
        const tokenData = {
          address: coin.baseToken.address,
          symbol: coin.baseToken.symbol,
          name: coin.baseToken.name,
          blockchain: coin.chainId || coin.dexId || 'ethereum',
          marketCap: marketCap || 0,
          volume24h: coin.volume?.h24 || 0,
          price: coin.priceUsd ? parseFloat(coin.priceUsd) : 0,
          priceChange24h: priceChange || 0,
          liquidity: coin.liquidity?.usd || 0,
          fdv: coin.fdv || 0,
          pairAddress: coin.pairAddress || '',
          pairCreatedAt: coin.pairCreatedAt || Date.now(),
          dexId: coin.dexId || '',
          chainId: coin.chainId || '',
          baseToken: coin.baseToken,
          quoteToken: coin.quoteToken,
        };
        
        const data = await whaleActivityService.getWhaleActivity(tokenData);
        setWhaleActivityData(data);
      } catch (error) {
        console.warn('Failed to fetch whale activity data:', error);
      } finally {
        setWhaleActivityLoading(false);
      }
    };
    
    fetchWhaleActivityData();
  }, [coin.baseToken.address, coin.baseToken.symbol, coin.baseToken.name, coin.chainId, coin.dexId, marketCap, coin.volume?.h24, coin.priceUsd, priceChange, coin.liquidity?.usd, coin.fdv, coin.pairAddress, coin.pairCreatedAt]);

  // Fetch technical analysis data on mount
  useEffect(() => {
    const fetchTechnicalData = async () => {
      try {
        const tokenData = {
          address: coin.baseToken.address,
          symbol: coin.baseToken.symbol,
          name: coin.baseToken.name,
          blockchain: coin.chainId || coin.dexId || 'ethereum',
          marketCap: marketCap || 0,
          volume24h: coin.volume?.h24 || 0,
          price: coin.priceUsd ? parseFloat(coin.priceUsd) : 0,
          priceChange24h: priceChange || 0,
          liquidity: coin.liquidity?.usd || 0,
          fdv: coin.fdv || 0,
          pairAddress: coin.pairAddress || '',
          pairCreatedAt: coin.pairCreatedAt || Date.now(),
          dexId: coin.dexId || '',
          chainId: coin.chainId || '',
          baseToken: coin.baseToken,
          quoteToken: coin.quoteToken,
        };
        
        const data = await technicalAnalysisService.getTechnicalAnalysis(tokenData);
        setTechnicalData(data);
      } catch (error) {
        console.warn('Failed to fetch technical analysis data:', error);
      }
    };
    
    fetchTechnicalData();
  }, [coin.baseToken.address, coin.baseToken.symbol, coin.baseToken.name, coin.chainId, coin.dexId, marketCap, coin.volume?.h24, coin.priceUsd, priceChange, coin.liquidity?.usd, coin.fdv, coin.pairAddress, coin.pairCreatedAt]);

  // Fetch holder analysis data on mount
  useEffect(() => {
    const fetchHolderData = async () => {
      try {
        const tokenData = {
          address: coin.baseToken.address,
          symbol: coin.baseToken.symbol,
          name: coin.baseToken.name,
          blockchain: coin.chainId || coin.dexId || 'ethereum',
          marketCap: marketCap || 0,
          volume24h: coin.volume?.h24 || 0,
          price: coin.priceUsd ? parseFloat(coin.priceUsd) : 0,
          priceChange24h: priceChange || 0,
          liquidity: coin.liquidity?.usd || 0,
          fdv: coin.fdv || 0,
          pairAddress: coin.pairAddress || '',
          pairCreatedAt: coin.pairCreatedAt || Date.now(),
          dexId: coin.dexId || '',
          chainId: coin.chainId || '',
          baseToken: coin.baseToken,
          quoteToken: coin.quoteToken,
        };
        
        const data = await holderAnalysisService.getHolderAnalysis(tokenData);
        setHolderData(data);
      } catch (error) {
        console.warn('Failed to fetch holder analysis data:', error);
      }
    };
    
    fetchHolderData();
  }, [coin.baseToken.address, coin.baseToken.symbol, coin.baseToken.name, coin.chainId, coin.dexId, marketCap, coin.volume?.h24, coin.priceUsd, priceChange, coin.liquidity?.usd, coin.fdv, coin.pairAddress, coin.pairCreatedAt]);
  
  // Calculate indicators
  const liquidityIndicator = calculateLiquidityIndicator(coin);
  const riskIndicator = calculateRiskIndicator(coin, rugCheckData || undefined);
  const socialMentionsIndicator = calculateSocialMentionsIndicator(socialMentionsData);
  const whaleActivityIndicator = calculateWhaleActivityIndicator(whaleActivityData || {
    last24h: { totalBuys: 0, totalSells: 0, netFlow: 0, uniqueWhales: 0, largestTransaction: 0, transactions: [] },
    last7d: { totalBuys: 0, totalSells: 0, netFlow: 0, uniqueWhales: 0, avgDailyVolume: 0 },
    topWallets: [],
    smartMoney: { following: 0, recentActivity: false, confidence: 0 },
  });

  const handleCardClick = () => {
    window.open(dexScreenerUrl, '_blank', 'noopener,noreferrer');
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy text: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="card group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-crypto-light-gray flex items-center justify-center">
            <img
              src={imageUrl}
              alt={coin.baseToken.symbol}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<span class="text-crypto-accent font-semibold">${coin.baseToken.symbol.charAt(0)}</span>`;
              }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg leading-tight">
              {coin.baseToken.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {coin.baseToken.symbol}
            </p>
          </div>
        </div>
        
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-crypto-accent transition-colors" />
      </div>

      {/* Indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        <LiquidityIndicator indicator={liquidityIndicator} showValue={false} />
        <div className="flex items-center gap-1">
          <RiskIndicator 
            indicator={riskIndicator} 
            showScore={false}
            onClick={rugCheckData ? () => setIsRugCheckModalOpen(true) : undefined}
          />
          {coin.chainId === 'solana' || coin.dexId?.toLowerCase() === 'solana' ? (
            <div className="text-xs text-gray-500">
              {rugCheckLoading ? (
                <span className="animate-pulse">🔄</span>
              ) : rugCheckData ? (
                <span title="Enhanced with rugcheck.xyz data">✓</span>
              ) : (
                <span title="Basic risk assessment">⚠️</span>
              )}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <SocialMentionsIndicator 
            indicator={socialMentionsIndicator} 
            showCount={true}
            showDetails={true}
          />
          <div className="text-xs text-gray-500">
            {socialMentionsLoading ? (
              <span className="animate-pulse">🔄</span>
            ) : socialMentionsData && socialMentionsData.current24h > 0 ? (
              <span title="Social mentions data available">📱</span>
            ) : (
              <span title="No social mentions data">📱</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <WhaleActivityIndicator 
            indicator={whaleActivityIndicator} 
            isLoading={whaleActivityLoading}
            showDetails={false}
          />
          <div className="text-xs text-gray-500">
            {whaleActivityLoading ? (
              <span className="animate-pulse">🔄</span>
            ) : whaleActivityData && whaleActivityData.last24h.uniqueWhales > 0 ? (
              <span title="Whale activity detected">🐋</span>
            ) : (
              <span title="No whale activity">🐋</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Contract Address */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Contract</span>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-mono">
              {truncateAddress(contractAddress)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(contractAddress);
              }}
              className="p-1 hover:bg-gray-700 rounded transition-colors group/copy"
              title={copied ? 'Copied!' : 'Copy contract address'}
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400 group-hover/copy:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Blockchain */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Blockchain</span>
          <span className="text-white text-sm font-medium capitalize">
            {coin.chainId || coin.dexId}
          </span>
        </div>

        {/* Market Cap */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Market Cap</span>
          <span className="text-crypto-accent font-semibold">
            {marketCap ? formatMarketCap(marketCap) : 'N/A'}
          </span>
        </div>

        {/* Liquidity */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Liquidity</span>
          <span className="text-white text-sm font-medium">
            {liquidityIndicator.value > 0 ? `$${liquidityIndicator.value.toLocaleString()}` : 'N/A'}
          </span>
        </div>

        {/* Age */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Age</span>
          <span className="text-white text-sm font-medium">
            {formatAge(age)}
          </span>
        </div>

        {/* Whale Activity */}
        {whaleActivityData && whaleActivityData.last24h.uniqueWhales > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Whale Activity</span>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm font-medium">
                {whaleActivityData.last24h.uniqueWhales} whales
              </span>
              {whaleActivityData.last24h.netFlow !== 0 && (
                <span className={`text-xs ${
                  whaleActivityData.last24h.netFlow > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {whaleActivityData.last24h.netFlow > 0 ? '+' : ''}
                  ${Math.abs(whaleActivityData.last24h.netFlow) >= 1000 
                    ? `${(whaleActivityData.last24h.netFlow / 1000).toFixed(1)}K`
                    : whaleActivityData.last24h.netFlow.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Social Mentions */}
        {socialMentionsData && socialMentionsData.current24h > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Social 24h</span>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm font-medium">
                {socialMentionsData.current24h} mentions
              </span>
              {socialMentionsData.changePercent !== 0 && (
                <span className={`text-xs ${
                  socialMentionsData.changePercent > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {socialMentionsData.changePercent > 0 ? '+' : ''}{socialMentionsData.changePercent.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price Change (if available) */}
        {priceChange !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">24h Change</span>
            <div className="flex items-center gap-1">
              {priceChange > 0 ? (
                <TrendingUp className="w-3 h-3 text-crypto-green" />
              ) : (
                <TrendingDown className="w-3 h-3 text-crypto-red" />
              )}
              <span className={`text-sm font-medium ${
                priceChange > 0 ? 'text-crypto-green' : 'text-crypto-red'
              }`}>
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Quote Token */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <span className="text-gray-400 text-sm">Paired with</span>
          <span className="text-gray-300 text-sm">
            {coin.quoteToken.symbol}
          </span>
        </div>
      </div>

      {/* Advanced Analysis Section */}
      <div className="mt-4 space-y-3">
        {/* Technical Analysis */}
        {technicalData && (
          <TechnicalAnalysisIndicator 
            data={technicalData} 
            showDetails={false}
          />
        )}
        
        {/* Holder Analysis */}
        {holderData && (
          <HolderAnalysisIndicator 
            data={holderData} 
            showDetails={false}
          />
        )}
      </div>

      {/* RugCheck Modal */}
      {rugCheckData && (
        <RugCheckModal
          isOpen={isRugCheckModalOpen}
          onClose={() => setIsRugCheckModalOpen(false)}
          rugCheckData={rugCheckData}
          tokenSymbol={coin.baseToken.symbol}
        />
      )}
    </div>
  );
};

export default CoinCard; 
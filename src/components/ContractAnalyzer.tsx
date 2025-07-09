import React, { useState } from 'react';
import { Search, AlertCircle, Copy, Check } from 'lucide-react';
import { rugCheckService, RugCheckRiskData } from '../services/rugcheck';
import { socialMentionsService } from '../services/social-mentions';
import { whaleActivityService } from '../services/whale-activity';
import { technicalAnalysisService } from '../services/technical-analysis';
import { holderAnalysisService } from '../services/holder-analysis';
import { calculateRiskIndicator, calculateLiquidityIndicator, calculateSocialMentionsIndicator, calculateWhaleActivityIndicator } from '../utils/indicators';
import SocialMentionsIndicator from './SocialMentionsIndicator';
import WhaleActivityIndicator from './WhaleActivityIndicator';
import { TechnicalAnalysisIndicator } from './TechnicalAnalysisIndicator';
import { HolderAnalysisIndicator } from './HolderAnalysisIndicator';
import RiskIndicator from './RiskIndicator';
import LiquidityIndicator from './LiquidityIndicator';
import RugCheckModal from './RugCheckModal';
import { 
  Coin, 
  TokenData,
  SocialMentionsData, 
  WhaleActivityData, 
  TechnicalData
} from '../types';
import { HolderAnalysisData } from '../services/holder-analysis';

interface ContractAnalyzerProps {
  onTokenFound?: (token: Coin) => void;
}

export const ContractAnalyzer: React.FC<ContractAnalyzerProps> = ({ onTokenFound }) => {
  const [contractAddress, setContractAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tokenData, setTokenData] = useState<Coin | null>(null);
  const [rugCheckData, setRugCheckData] = useState<RugCheckRiskData | null>(null);
  const [socialMentionsData, setSocialMentionsData] = useState<SocialMentionsData | null>(null);
  const [whaleActivityData, setWhaleActivityData] = useState<WhaleActivityData | null>(null);
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null);
  const [holderData, setHolderData] = useState<HolderAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRugCheckModalOpen, setIsRugCheckModalOpen] = useState(false);

  const isValidAddress = (address: string): boolean => {
    // Ethereum-style addresses (0x followed by 40 hex characters)
    const ethPattern = /^0x[a-fA-F0-9]{40}$/;
    
    // Solana-style addresses (base58, 32-44 characters)
    const solPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    
    return ethPattern.test(address) || solPattern.test(address);
  };

  const getTokenImageUrl = (address: string): string => {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        console.error('Failed to copy to clipboard:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const fetchTokenByAddress = async (address: string): Promise<Coin | null> => {
    try {
      // Try to search for the token directly using the contract address
      const searchUrl = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data && data.pairs && data.pairs.length > 0) {
        return data.pairs[0]; // Return the first (most liquid) pair
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching token by address:', error);
      throw new Error('Failed to fetch token data');
    }
  };

  const analyzeContract = async () => {
    const address = contractAddress.trim();
    
    if (!address) {
      setError('Please enter a contract address');
      return;
    }

    if (!isValidAddress(address)) {
      setError('Invalid contract address format');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setTokenData(null);
    setRugCheckData(null);
    setSocialMentionsData(null);
    setWhaleActivityData(null);
    setTechnicalData(null);
    setHolderData(null);

    try {
      // Fetch token data from DexScreener
      console.log('Fetching token data for:', address);
      const token = await fetchTokenByAddress(address);
      
      if (!token) {
        throw new Error('Token not found on DexScreener. Please check the contract address.');
      }

      setTokenData(token);

      // Create TokenData object for analysis services
      const tokenAnalysisData: TokenData = {
        address: token.baseToken.address,
        symbol: token.baseToken.symbol,
        name: token.baseToken.name,
        blockchain: token.chainId || 'ethereum',
        marketCap: token.marketCap || token.fdv || 0,
        volume24h: token.volume?.h24 || 0,
        price: token.priceUsd ? parseFloat(token.priceUsd) : 0,
        priceChange24h: token.priceChange?.h24 || 0,
        liquidity: token.liquidity?.usd || 0,
        fdv: token.fdv || 0,
        pairAddress: token.pairAddress,
        pairCreatedAt: token.pairCreatedAt,
        dexId: token.dexId,
        chainId: token.chainId || 'ethereum',
        baseToken: token.baseToken,
        quoteToken: token.quoteToken,
      };
      
      // Parallel analysis of all risk factors
      console.log(`🔄 Starting comprehensive analysis for ${token.baseToken.symbol} (${token.baseToken.name})`);
      
      const [
        rugCheckResult,
        socialMentionsResult,
        whaleActivityResult,
        technicalResult,
        holderResult
      ] = await Promise.allSettled([
        rugCheckService.getTokenRisk(address)
          .catch((err: any) => {
            console.warn('❌ Rug check failed:', err);
            return null;
          }),
        socialMentionsService.searchMentions(token.baseToken.symbol)
          .catch((err: any) => {
            console.warn('❌ Social mentions failed:', err);
            return null;
          }),
        whaleActivityService.getWhaleActivity(tokenAnalysisData)
          .catch((err: any) => {
            console.warn('❌ Whale activity failed:', err);
            return null;
          }),
        technicalAnalysisService.getTechnicalAnalysis(tokenAnalysisData)
          .catch((err: any) => {
            console.warn('❌ Technical analysis failed:', err);
            return null;
          }),
        holderAnalysisService.getHolderAnalysis(tokenAnalysisData)
          .catch((err: any) => {
            console.warn('❌ Holder analysis failed:', err);
            return null;
          })
      ]);

      // Process results
      console.log('📋 Processing analysis results...');
      
      if (rugCheckResult.status === 'fulfilled' && rugCheckResult.value) {
        console.log('✅ Rug check data processed successfully');
        setRugCheckData(rugCheckResult.value);
      } else {
        console.log('⚠️ No rug check data available');
      }
      
      if (socialMentionsResult.status === 'fulfilled' && socialMentionsResult.value) {
        console.log('✅ Social mentions data processed successfully:', socialMentionsResult.value);
        setSocialMentionsData(socialMentionsResult.value);
      } else {
        console.log('⚠️ No social mentions data available');
      }
      
      if (whaleActivityResult.status === 'fulfilled' && whaleActivityResult.value) {
        console.log('✅ Whale activity data processed successfully');
        setWhaleActivityData(whaleActivityResult.value);
      } else {
        console.log('⚠️ No whale activity data available');
      }
      
      if (technicalResult.status === 'fulfilled' && technicalResult.value) {
        console.log('✅ Technical analysis data processed successfully');
        setTechnicalData(technicalResult.value);
      } else {
        console.log('⚠️ No technical analysis data available');
      }
      
      if (holderResult.status === 'fulfilled' && holderResult.value) {
        console.log('✅ Holder analysis data processed successfully');
        setHolderData(holderResult.value);
      } else {
        console.log('⚠️ No holder analysis data available');
      }

      if (onTokenFound) {
        onTokenFound(token);
      }

    } catch (error) {
      console.error('Contract analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze contract');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeContract();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      analyzeContract();
    }
  };

  // Calculate indicators
  const riskIndicator = tokenData ? calculateRiskIndicator(tokenData, rugCheckData || undefined) : null;
  const liquidityIndicator = tokenData ? calculateLiquidityIndicator(tokenData) : null;
  const socialIndicator = socialMentionsData ? calculateSocialMentionsIndicator(socialMentionsData) : null;
  const whaleIndicator = whaleActivityData ? calculateWhaleActivityIndicator(whaleActivityData) : null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Contract Analyzer</h2>
        <p className="text-gray-400">
          Analyze any token by entering its contract address for comprehensive risk assessment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter contract address (0x... or Solana address)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing || !contractAddress.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {tokenData && (
        <div className="space-y-6">
          {/* Token Header */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <img
                src={getTokenImageUrl(tokenData.baseToken.address)}
                alt={tokenData.baseToken.symbol}
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/48/1f2937/9ca3af?text=${tokenData.baseToken.symbol}`;
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{tokenData.baseToken.name}</h3>
                  <span className="text-gray-400 text-lg">{tokenData.baseToken.symbol}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="font-mono">{tokenData.baseToken.address}</span>
                  <button
                    onClick={() => copyToClipboard(tokenData.baseToken.address)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title={copied ? 'Copied!' : 'Copy contract address'}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${tokenData.priceUsd ? parseFloat(tokenData.priceUsd).toFixed(8) : '0.00000000'}
                </div>
                <div className={`text-sm font-medium ${
                  (tokenData.priceChange?.h24 || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(tokenData.priceChange?.h24 || 0) >= 0 ? '+' : ''}
                  {(tokenData.priceChange?.h24 || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Risk Indicator */}
            {riskIndicator && (
              <RiskIndicator 
                indicator={riskIndicator}
                showScore={false}
                onClick={rugCheckData ? () => setIsRugCheckModalOpen(true) : undefined}
              />
            )}

            {/* Liquidity Indicator */}
            {liquidityIndicator && (
              <LiquidityIndicator 
                indicator={liquidityIndicator}
                showValue={false}
              />
            )}

            {/* Social Mentions */}
            {socialIndicator && (
              <SocialMentionsIndicator 
                indicator={socialIndicator}
                showCount={true}
              />
            )}

            {/* Whale Activity */}
            {whaleIndicator && (
              <WhaleActivityIndicator 
                indicator={whaleIndicator}
                showDetails={false}
              />
            )}

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

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Social Mentions Details */}
            {socialMentionsData && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Social Activity</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">24h Mentions:</span>
                    <span className="text-white font-medium">{socialMentionsData.current24h}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Previous 24h:</span>
                    <span className="text-white font-medium">{socialMentionsData.previous24h}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Change:</span>
                    <span className={`font-medium ${
                      socialMentionsData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {socialMentionsData.changePercent >= 0 ? '+' : ''}
                      {socialMentionsData.changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Sentiment:</span>
                    <div className="flex gap-2 text-sm">
                      <span className="text-green-400">
                        {socialMentionsData.sentiment.positive}% pos
                      </span>
                      <span className="text-red-400">
                        {socialMentionsData.sentiment.negative}% neg
                      </span>
                      <span className="text-gray-400">
                        {socialMentionsData.sentiment.neutral}% neu
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Whale Activity Details */}
            {whaleActivityData && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Whale Activity</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">24h Volume:</span>
                    <span className="text-white font-medium">
                      ${((whaleActivityData.last24h.totalBuys + whaleActivityData.last24h.totalSells) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Whales:</span>
                    <span className="text-white font-medium">
                      {whaleActivityData.last24h.uniqueWhales}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Net Flow:</span>
                    <span className={`font-medium ${
                      whaleActivityData.last24h.netFlow >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${whaleActivityData.last24h.netFlow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Smart Money:</span>
                    <span className="text-white font-medium">
                      {whaleActivityData.smartMoney.following} following
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RugCheck Modal */}
      {rugCheckData && tokenData && (
        <RugCheckModal
          isOpen={isRugCheckModalOpen}
          onClose={() => setIsRugCheckModalOpen(false)}
          rugCheckData={rugCheckData}
          tokenSymbol={tokenData.baseToken.symbol}
        />
      )}
    </div>
  );
};

export default ContractAnalyzer; 
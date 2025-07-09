import axios from 'axios';

export interface RugCheckResponse {
  mint: string;
  symbol: string;
  name: string;
  description: string;
  image: string;
  creator: string;
  creation_tx: string;
  created_timestamp: number;
  mint_authority: string | null;
  freeze_authority: string | null;
  supply: number;
  decimals: number;
  holders: number;
  total_supply: number;
  circulating_supply: number;
  markets: Array<{
    market: string;
    liquidity: number;
    volume_24h: number;
    price: number;
    price_change_24h: number;
    market_cap: number;
    fdv: number;
    pool_address: string;
    base_amount: number;
    quote_amount: number;
    base_reserve: number;
    quote_reserve: number;
    lp_locked: boolean;
    lp_locked_pct: number;
    lp_burn_pct: number;
    top_10_holders_pct: number;
    risks: Array<{
      name: string;
      description: string;
      level: 'info' | 'warn' | 'danger';
      score: number;
    }>;
  }>;
  risks: Array<{
    name: string;
    description: string;
    level: 'info' | 'warn' | 'danger';
    score: number;
  }>;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface RugCheckRiskData {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  risks: Array<{
    name: string;
    description: string;
    level: 'info' | 'warn' | 'danger';
    score: number;
  }>;
  holders: number;
  liquidity: number;
  lpLocked: boolean;
  lpLockedPct: number;
  topHoldersPct: number;
  mintAuthority: boolean;
  freezeAuthority: boolean;
}

class RugCheckService {
  private readonly baseUrl = 'https://api.rugcheck.xyz/v1';
  private readonly requestTimeout = 10000;

  /**
   * Get token risk analysis from rugcheck.xyz
   */
  async getTokenRisk(tokenAddress: string): Promise<RugCheckRiskData | null> {
    try {
      console.log(`🔍 Fetching rugcheck data for token: ${tokenAddress}`);
      
      const response = await axios.get<RugCheckResponse>(
        `${this.baseUrl}/tokens/${tokenAddress}/report`,
        {
          timeout: this.requestTimeout,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MemeScreener/1.0'
          }
        }
      );

      const data = response.data;
      
      console.log(`📊 Raw rugcheck API response for ${tokenAddress}:`, JSON.stringify(data, null, 2));
      
      if (!data || !data.mint) {
        console.warn(`⚠️ Invalid rugcheck response for ${tokenAddress}`);
        return null;
      }

      // Extract market data (use first market if multiple)
      const market = data.markets?.[0];
      
      console.log(`📈 Market data extracted:`, market);
      
      const riskData: RugCheckRiskData = {
        riskScore: data.risk_score || 0,
        riskLevel: data.risk_level || 'medium',
        risks: data.risks || [],
        holders: data.holders || 0,
        liquidity: market?.liquidity || 0,
        lpLocked: market?.lp_locked || false,
        lpLockedPct: market?.lp_locked_pct || 0,
        topHoldersPct: market?.top_10_holders_pct || 0,
        mintAuthority: data.mint_authority !== null,
        freezeAuthority: data.freeze_authority !== null
      };

      console.log(`✅ Rugcheck data processed for ${tokenAddress}:`, {
        riskScore: riskData.riskScore,
        riskLevel: riskData.riskLevel,
        holders: riskData.holders,
        liquidity: riskData.liquidity,
        lpLocked: riskData.lpLocked,
        lpLockedPct: riskData.lpLockedPct,
        topHoldersPct: riskData.topHoldersPct,
        mintAuthority: riskData.mintAuthority,
        freezeAuthority: riskData.freezeAuthority,
        risksCount: riskData.risks.length
      });

      return riskData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.warn(`⚠️ Token not found in rugcheck: ${tokenAddress}`);
        } else if (error.response?.status === 429) {
          console.warn(`⚠️ Rugcheck rate limit exceeded for ${tokenAddress}`);
        } else if (error.response?.status === 403) {
          console.warn(`⚠️ Rugcheck API access forbidden for ${tokenAddress} - may need API key`);
        } else {
          console.error(`❌ Rugcheck API error for ${tokenAddress}:`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            url: error.config?.url
          });
        }
      } else {
        console.error(`❌ Unexpected error fetching rugcheck data for ${tokenAddress}:`, error);
      }
      return null;
    }
  }

  /**
   * Get multiple token risks in batch (with rate limiting)
   */
  async getTokenRisksBatch(tokenAddresses: string[]): Promise<Map<string, RugCheckRiskData>> {
    const results = new Map<string, RugCheckRiskData>();
    const batchSize = 5; // Limit concurrent requests
    const delay = 1000; // 1 second delay between batches

    console.log(`🔄 Fetching rugcheck data for ${tokenAddresses.length} tokens in batches of ${batchSize}`);

    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      const batch = tokenAddresses.slice(i, i + batchSize);
      
      const promises = batch.map(async (address) => {
        const riskData = await this.getTokenRisk(address);
        return { address, riskData };
      });

      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.riskData) {
          results.set(result.value.address, result.value.riskData);
        } else {
          console.warn(`⚠️ Failed to get rugcheck data for ${batch[index]}`);
        }
      });

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < tokenAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`✅ Rugcheck batch complete: ${results.size}/${tokenAddresses.length} successful`);
    return results;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with a known Solana token address (e.g., USDC)
      const testAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const response = await axios.get(
        `${this.baseUrl}/tokens/${testAddress}/report`,
        {
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MemeScreener/1.0'
          }
        }
      );

      console.log('✅ Rugcheck API connection test successful');
      return response.status === 200;
    } catch (error) {
      console.error('❌ Rugcheck API connection test failed:', error);
      return false;
    }
  }
}

export const rugCheckService = new RugCheckService(); 
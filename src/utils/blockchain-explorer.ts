import { Blockchain } from '../types';

// Blockchain explorer endpoints for different networks
const EXPLORER_ENDPOINTS = {
  solana: {
    holderCount: 'https://api.helius.xyz/v0/token-metadata', // Example - would need proper API key
    explorer: 'https://solscan.io'
  },
  ethereum: {
    holderCount: 'https://api.etherscan.io/api',
    explorer: 'https://etherscan.io'
  },
  base: {
    holderCount: 'https://api.basescan.org/api',
    explorer: 'https://basescan.org'
  },
  bsc: {
    holderCount: 'https://api.bscscan.com/api',
    explorer: 'https://bscscan.com'
  },
  polygon: {
    holderCount: 'https://api.polygonscan.com/api',
    explorer: 'https://polygonscan.com'
  },
  tron: {
    holderCount: 'https://api.trongrid.io',
    explorer: 'https://tronscan.org'
  },
  sui: {
    holderCount: 'https://sui-mainnet.public.blastapi.io',
    explorer: 'https://suiscan.xyz'
  }
};

/**
 * Get holder count for a token contract address
 * Note: This is a placeholder implementation. In production, you would need:
 * 1. API keys for various blockchain explorers
 * 2. Different endpoints for different blockchain networks
 * 3. Rate limiting and error handling
 */
export async function getTokenHolderCount(
  contractAddress: string,
  blockchain: Blockchain
): Promise<number | undefined> {
  try {
    // TODO: Implement actual API calls to blockchain explorers
    // For now, return undefined to show "N/A" in the UI
    
    console.log(`TODO: Fetch holder count for ${contractAddress} on ${blockchain}`);
    
    // Example implementation structure:
    // const endpoint = EXPLORER_ENDPOINTS[blockchain];
    // const response = await fetch(`${endpoint.holderCount}?address=${contractAddress}`);
    // const data = await response.json();
    // return data.holderCount;
    
    return undefined;
  } catch (error) {
    console.error(`Failed to fetch holder count for ${contractAddress}:`, error);
    return undefined;
  }
}

/**
 * Get blockchain explorer URL for a token contract
 */
export function getTokenExplorerUrl(
  contractAddress: string,
  blockchain: Blockchain
): string {
  const chainMap: Record<string, string> = {
    solana: `https://solscan.io/token/${contractAddress}`,
    ethereum: `https://etherscan.io/token/${contractAddress}`,
    base: `https://basescan.org/token/${contractAddress}`,
    bsc: `https://bscscan.com/token/${contractAddress}`,
    polygon: `https://polygonscan.com/token/${contractAddress}`,
    tron: `https://tronscan.org/#/token20/${contractAddress}`,
    sui: `https://suiscan.xyz/mainnet/coin/${contractAddress}`
  };

  return chainMap[blockchain] || `https://etherscan.io/token/${contractAddress}`;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (fallbackErr) {
      console.error('Failed to copy to clipboard:', fallbackErr);
      return false;
    }
  }
}

/**
 * Format contract address for display
 */
export function formatContractAddress(address: string, length: number = 8): string {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
} 
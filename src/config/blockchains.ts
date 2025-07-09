import { Blockchain, BlockchainConfig } from '../types';

export const BLOCKCHAIN_CONFIGS: Record<Blockchain, BlockchainConfig> = {
  solana: {
    name: 'solana',
    chainId: 'solana',
    quoteTokens: ['SOL', 'USDC', 'USDT'],
    displayName: 'Solana'
  },
  sui: {
    name: 'sui',
    chainId: 'sui',
    quoteTokens: ['SUI', 'USDC', 'USDT'],
    displayName: 'Sui'
  },
  base: {
    name: 'base',
    chainId: 'base',
    quoteTokens: ['ETH', 'USDC', 'USDT'],
    displayName: 'Base'
  },
  tron: {
    name: 'tron',
    chainId: 'tron',
    quoteTokens: ['TRX', 'USDT', 'USDC'],
    displayName: 'Tron'
  }
};

export const SUPPORTED_BLOCKCHAINS: Blockchain[] = ['solana', 'sui', 'base', 'tron'];

export const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?'
]; 
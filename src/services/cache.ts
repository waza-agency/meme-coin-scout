interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000; // Prevent memory issues

  /**
   * Store data in cache with expiration time
   * @param key - Unique cache key
   * @param data - Data to cache
   * @param ttlMs - Time to live in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now();
    const expiresAt = now + ttlMs;
    
    // Clear expired items if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.clearExpired();
    }
    
    // If still full after cleanup, remove oldest items
    if (this.cache.size >= this.maxSize) {
      const oldestKeys = Array.from(this.cache.keys()).slice(0, 100);
      oldestKeys.forEach(k => this.cache.delete(k));
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
    
    console.log(`📦 Cached: ${key} (expires in ${ttlMs / 1000}s)`);
  }

  /**
   * Retrieve data from cache if not expired
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      console.log(`🗑️ Expired cache: ${key}`);
      return null;
    }
    
    console.log(`✅ Cache hit: ${key} (${Math.floor((item.expiresAt - now) / 1000)}s remaining)`);
    return item.data;
  }

  /**
   * Check if a key exists and is not expired
   * @param key - Cache key
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove a specific cache entry
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Manually deleted cache: ${key}`);
  }

  /**
   * Clear all expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared entire cache (${size} entries)`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize
    };
  }

  /**
   * Generate a consistent cache key from parameters
   * @param prefix - Service prefix (e.g., 'social', 'rugcheck')
   * @param params - Parameters to include in key
   */
  generateKey(prefix: string, ...params: any[]): string {
    const paramString = params
      .map(p => typeof p === 'object' ? JSON.stringify(p) : String(p))
      .join('|');
    return `${prefix}:${paramString}`.toLowerCase();
  }
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SOCIAL_MENTIONS: 15 * 60 * 1000,    // 15 minutes - expensive API
  RUGCHECK: 5 * 60 * 1000,            // 5 minutes - free API, short cache for performance
  DEXSCREENER_SEARCH: 5 * 60 * 1000,  // 5 minutes - market data changes frequently
  TOKEN_DETAILS: 2 * 60 * 1000,       // 2 minutes - price data changes quickly
} as const;

// Export singleton instance
export const cacheService = new CacheService();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cacheService.clearExpired();
}, 5 * 60 * 1000);
// API Error Monitor - tracks API failures globally
interface ApiErrors {
  xai: boolean;
  twitter: boolean;
  rugcheck: boolean;
  solanaTracker: boolean;
}

class ApiMonitor {
  private listeners: ((errors: ApiErrors) => void)[] = [];
  private errors: ApiErrors = {
    xai: false,
    twitter: false,
    rugcheck: false,
    solanaTracker: false
  };

  private getApiKeyPrefix(envVarName: string): string {
    try {
      const apiKey = (window as any).import?.meta?.env?.[envVarName];
      if (typeof apiKey === 'string' && apiKey.length > 0) {
        return apiKey.substring(0, 8) + '...';
      }
      return 'Not configured';
    } catch (error) {
      return 'Access error';
    }
  }

  subscribe(listener: (errors: ApiErrors) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyError(api: 'xai' | 'twitter' | 'rugcheck' | 'solanaTracker', error?: any) {
    this.errors[api] = true;
    
    // Log specific error guidance
    if (api === 'xai' && error?.response?.status === 403) {
      console.error(`
🚨 Xai API Access Forbidden (403)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your API key does not have access to the Xai API.

To fix this:
1. Go to https://console.x.ai/
2. Check your API key permissions
3. Ensure your account has API access enabled
4. You may need to add payment method or credits

Current API key: ${this.getApiKeyPrefix('VITE_XAI_API_KEY')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    }
    
    this.listeners.forEach(listener => listener(this.errors));
  }

  clearError(api: 'xai' | 'twitter' | 'rugcheck' | 'solanaTracker') {
    this.errors[api] = false;
    this.listeners.forEach(listener => listener(this.errors));
  }

  getErrors() {
    return { ...this.errors };
  }
}

export const apiMonitor = new ApiMonitor();

// Enhanced error detection with structured error parsing
class ErrorDetector {
  private static isAxiosError(error: unknown): error is { response?: { status?: number; config?: { url?: string } } } {
    return typeof error === 'object' && error !== null && 'response' in error;
  }

  private static isFetchError(error: unknown): error is { status?: number; url?: string } {
    return typeof error === 'object' && error !== null && ('status' in error || 'url' in error);
  }

  private static extractErrorInfo(args: unknown[]): { status?: number; url?: string; errorType?: string } {
    for (const arg of args) {
      // Check for Axios error structure
      if (this.isAxiosError(arg)) {
        return {
          status: arg.response?.status,
          url: arg.response?.config?.url,
          errorType: 'axios'
        };
      }
      
      // Check for Fetch error structure
      if (this.isFetchError(arg)) {
        return {
          status: arg.status,
          url: arg.url,
          errorType: 'fetch'
        };
      }
      
      // Check for Error objects with relevant properties
      if (arg instanceof Error) {
        const errorMessage = arg.message.toLowerCase();
        if (errorMessage.includes('cors')) {
          return { errorType: 'cors' };
        }
        if (errorMessage.includes('network')) {
          return { errorType: 'network' };
        }
      }
    }
    
    return {};
  }

  static detectApiError(args: unknown[]) {
    const errorInfo = this.extractErrorInfo(args);
    const { status, url, errorType } = errorInfo;
    
    // Xai API errors (403 Forbidden)
    if (url && url.includes('api.x.ai') && status === 403) {
      apiMonitor.notifyError('xai', { response: { status: 403 } });
      return;
    }
    
    // Twitter API errors (CORS or 401/403)
    if (url && url.includes('api.twitter.com')) {
      if (errorType === 'cors' || status === 401 || status === 403) {
        apiMonitor.notifyError('twitter');
        return;
      }
    }
    
    // RugCheck API errors (429 Rate Limit)
    if (url && url.includes('rugcheck') && status === 429) {
      apiMonitor.notifyError('rugcheck');
      return;
    }
    
    // Solana Tracker API errors (401 Unauthorized)
    if (url && url.includes('solanatracker') && status === 401) {
      apiMonitor.notifyError('solanaTracker');
      return;
    }
  }
}

// Auto-detect API errors from console with improved parsing
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args: unknown[]) {
    ErrorDetector.detectApiError(args);
    originalError.apply(console, args);
  };
}
// API Error Monitor - tracks API failures globally
class ApiMonitor {
  private listeners: ((errors: any) => void)[] = [];
  private errors = {
    xai: false,
    twitter: false,
    rugcheck: false,
    solanaTracker: false
  };

  subscribe(listener: (errors: any) => void) {
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

Current API key: ${(window as any).import?.meta?.env?.VITE_XAI_API_KEY?.substring(0, 20)}...
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

// Auto-detect API errors from console
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Detect Xai API errors
    if (message.includes('api.x.ai') && message.includes('403')) {
      apiMonitor.notifyError('xai', { response: { status: 403 } });
    }
    
    // Detect Twitter API CORS errors
    if (message.includes('api.twitter.com') && message.includes('CORS')) {
      apiMonitor.notifyError('twitter');
    }
    
    // Detect RugCheck rate limiting
    if (message.includes('rugcheck') && message.includes('429')) {
      apiMonitor.notifyError('rugcheck');
    }
    
    // Detect Solana Tracker unauthorized
    if (message.includes('solanatracker') && message.includes('401')) {
      apiMonitor.notifyError('solanaTracker');
    }
    
    originalError.apply(console, args);
  };
}
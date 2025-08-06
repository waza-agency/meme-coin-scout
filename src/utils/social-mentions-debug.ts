// Social Mentions Debug Utility
import axios from 'axios';
import { socialMentionsService } from '../services/social-mentions';

export interface DebugResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  action?: string;
}

export class SocialMentionsDebugger {
  private results: DebugResult[] = [];
  private proxyUrl = 'http://localhost:3007';

  async runFullDiagnostic(): Promise<DebugResult[]> {
    this.results = [];
    
    console.log('🔍 Starting Social Mentions Diagnostic...');
    
    await this.checkEnvironment();
    await this.checkProxyServer();
    await this.testTwitterToken();
    await this.testServiceLayer();
    
    this.printSummary();
    return this.results;
  }

  private addResult(step: string, status: 'success' | 'error' | 'warning', message: string, details?: any, action?: string) {
    const result: DebugResult = { step, status, message, details, action };
    this.results.push(result);
    
    const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
    console.log(`${icon} ${step}: ${message}`);
    
    if (details) {
      console.log('   Details:', details);
    }
    
    if (action) {
      console.log(`   💡 Action: ${action}`);
    }
  }

  private async checkEnvironment() {
    const twitterToken = (import.meta as any).env?.VITE_TWITTER_BEARER_TOKEN || '';
    
    if (!twitterToken) {
      this.addResult(
        'Environment Check', 
        'error', 
        'No Twitter Bearer Token found',
        { envVar: 'VITE_TWITTER_BEARER_TOKEN' },
        'Add VITE_TWITTER_BEARER_TOKEN to .env.local file'
      );
      return;
    }
    
    if (twitterToken.length < 50) {
      this.addResult(
        'Environment Check', 
        'error', 
        'Twitter token appears too short',
        { tokenLength: twitterToken.length },
        'Verify your Twitter Bearer Token is complete'
      );
      return;
    }
    
    if (!twitterToken.startsWith('AAAAAAAAAAAAAAAAAAAAAA')) {
      this.addResult(
        'Environment Check', 
        'warning', 
        'Twitter token format looks unusual',
        { tokenPrefix: twitterToken.substring(0, 20) },
        'Verify this is a valid Twitter Bearer Token'
      );
      return;
    }
    
    this.addResult(
      'Environment Check', 
      'success', 
      'Twitter Bearer Token found and looks valid',
      { tokenLength: twitterToken.length, tokenPrefix: twitterToken.substring(0, 15) + '...' }
    );
  }

  private async checkProxyServer() {
    try {
      const response = await axios.get(`${this.proxyUrl}/api/health`, { 
        timeout: 3000 
      });
      
      if (response.status === 200) {
        this.addResult(
          'Proxy Server Check', 
          'success', 
          'Backend proxy server is running',
          { url: this.proxyUrl, status: response.status }
        );
      } else {
        this.addResult(
          'Proxy Server Check', 
          'warning', 
          'Proxy server responded but with unexpected status',
          { url: this.proxyUrl, status: response.status }
        );
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        this.addResult(
          'Proxy Server Check', 
          'error', 
          'Backend proxy server is not running',
          { url: this.proxyUrl, error: error.message },
          'Run "npm run server" in a separate terminal'
        );
      } else {
        this.addResult(
          'Proxy Server Check', 
          'error', 
          'Cannot connect to proxy server',
          { url: this.proxyUrl, error: error.message }
        );
      }
    }
  }

  private async testTwitterToken() {
    try {
      console.log('🐦 Testing Twitter API token directly via proxy...');
      
      const response = await axios.get(`${this.proxyUrl}/api/twitter/search`, {
        params: {
          query: 'hello -is:retweet lang:en',
          max_results: 10
        },
        timeout: 15000
      });

      const tweetCount = response.data.data?.length || 0;
      
      this.addResult(
        'Twitter API Test', 
        'success', 
        `Twitter API token is valid and working`,
        { 
          tweetsFound: tweetCount, 
          apiResponse: response.data.meta || {},
          query: 'hello -is:retweet lang:en'
        }
      );
      
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      if (status === 401) {
        this.addResult(
          'Twitter API Test', 
          'error', 
          'Twitter API authentication failed - token is invalid or expired',
          { status, error: data },
          'Get a new Bearer Token from https://developer.twitter.com/en/portal/dashboard'
        );
      } else if (status === 403) {
        this.addResult(
          'Twitter API Test', 
          'error', 
          'Twitter API access forbidden - check token permissions or app status',
          { status, error: data },
          'Check your Twitter Developer portal for app status and permissions'
        );
      } else if (status === 429) {
        this.addResult(
          'Twitter API Test', 
          'warning', 
          'Twitter API rate limit exceeded',
          { status, error: data },
          'Wait 15 minutes and try again, or upgrade your Twitter API plan'
        );
      } else if (error.code === 'ECONNREFUSED') {
        this.addResult(
          'Twitter API Test', 
          'error', 
          'Cannot connect to proxy server for Twitter test',
          { error: error.message },
          'Make sure the proxy server is running: npm run server'
        );
      } else {
        this.addResult(
          'Twitter API Test', 
          'error', 
          'Twitter API test failed with unknown error',
          { status, error: data || error.message }
        );
      }
    }
  }

  private async testServiceLayer() {
    try {
      console.log('📱 Testing social mentions service layer...');
      
      const result = await socialMentionsService.searchMentions('BTC', '24h');
      
      if (result === null) {
        this.addResult(
          'Service Layer Test', 
          'warning', 
          'Service returned null - check previous errors',
          { result: null },
          'Fix the issues found in previous steps'
        );
      } else {
        this.addResult(
          'Service Layer Test', 
          'success', 
          'Service layer is working correctly',
          { 
            mentions24h: result.current24h,
            sentiment: result.sentiment,
            totalReach: result.totalReach
          }
        );
      }
    } catch (error: any) {
      this.addResult(
        'Service Layer Test', 
        'error', 
        'Service layer test failed',
        { error: error.message },
        'Check the service implementation and previous diagnostic steps'
      );
    }
  }

  private printSummary() {
    console.log('\n📋 DIAGNOSTIC SUMMARY');
    console.log('═════════════════════');
    
    const successCount = this.results.filter(r => r.status === 'success').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Passed: ${successCount}`);
    console.log(`⚠️ Warnings: ${warningCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0 && warningCount === 0) {
      console.log('\n🎉 All checks passed! Social mentions should be working.');
    } else if (errorCount === 0) {
      console.log('\n⚠️ Some warnings found, but functionality should work.');
    } else {
      console.log('\n🔧 Issues found that need to be fixed:');
      
      const errors = this.results.filter(r => r.status === 'error');
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.step}`);
        console.log(`   Problem: ${error.message}`);
        if (error.action) {
          console.log(`   Solution: ${error.action}`);
        }
      });
    }
    
    console.log('\n💡 Quick Setup Guide:');
    console.log('1. Get Twitter Bearer Token: https://developer.twitter.com/en/portal/dashboard');
    console.log('2. Add to .env.local: VITE_TWITTER_BEARER_TOKEN=your_token_here');
    console.log('3. Start backend proxy: npm run server');
    console.log('4. Start frontend: npm run dev');
    console.log('5. Or run both: npm run dev:full');
  }
}

export const debugSocialMentions = async () => {
  const diagnostic = new SocialMentionsDebugger();
  return await diagnostic.runFullDiagnostic();
};

// Auto-expose to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).debugSocialMentions = debugSocialMentions;
  console.log('💡 Social Mentions Debug Tool Available!');
  console.log('📍 Run in console: debugSocialMentions()');
  
  // Also expose as a simpler name
  (window as any).debugSocial = debugSocialMentions;
  console.log('📍 Or use shorthand: debugSocial()');
}
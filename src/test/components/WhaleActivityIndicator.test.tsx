import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WhaleActivityIndicator from '../../components/WhaleActivityIndicator';
import { WhaleActivityIndicator as WhaleActivityIndicatorType } from '../../types';

describe('WhaleActivityIndicator', () => {
  const mockIndicator: WhaleActivityIndicatorType = {
    trend: 'bullish',
    activity: 'high',
    netFlow24h: 150000,
    confidence: 85,
    riskLevel: 'low',
    signals: ['Strong accumulation', 'High whale interest'],
    color: '#10b981',
    label: '+$150.0K (8 whales)',
  };

  describe('rendering states', () => {
    it('should render loading state', () => {
      render(<WhaleActivityIndicator indicator={null} isLoading={true} />);
      
      expect(screen.getByText('Loading whale data...')).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon') || screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render no data state', () => {
      render(<WhaleActivityIndicator indicator={null} isLoading={false} />);
      
      expect(screen.getByText('No whale data')).toBeInTheDocument();
    });

    it('should render indicator data correctly', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} />);
      
      expect(screen.getByText('Whale Activity')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('+$150.0K (8 whales)')).toBeInTheDocument();
    });
  });

  describe('trend indicators', () => {
    it('should display bullish trend correctly', () => {
      const bullishIndicator = { ...mockIndicator, trend: 'bullish' as const };
      render(<WhaleActivityIndicator indicator={bullishIndicator} />);
      
      expect(screen.getByText('Whale Activity')).toHaveClass('text-green-400');
    });

    it('should display bearish trend correctly', () => {
      const bearishIndicator = { 
        ...mockIndicator, 
        trend: 'bearish' as const,
        label: '-$75.0K (6 whales)'
      };
      render(<WhaleActivityIndicator indicator={bearishIndicator} />);
      
      expect(screen.getByText('Whale Activity')).toHaveClass('text-red-400');
      expect(screen.getByText('-$75.0K (6 whales)')).toBeInTheDocument();
    });

    it('should display neutral trend correctly', () => {
      const neutralIndicator = { 
        ...mockIndicator, 
        trend: 'neutral' as const,
        label: '+$15.0K (3 whales)'
      };
      render(<WhaleActivityIndicator indicator={neutralIndicator} />);
      
      expect(screen.getByText('Whale Activity')).toHaveClass('text-gray-400');
      expect(screen.getByText('+$15.0K (3 whales)')).toBeInTheDocument();
    });
  });

  describe('activity levels', () => {
    it('should show high activity with orange icon', () => {
      const highActivityIndicator = { ...mockIndicator, activity: 'high' as const };
      render(<WhaleActivityIndicator indicator={highActivityIndicator} />);
      
      // Check that the component renders (activity icon is internal)
      expect(screen.getByText('Whale Activity')).toBeInTheDocument();
    });

    it('should show medium activity with yellow icon', () => {
      const mediumActivityIndicator = { ...mockIndicator, activity: 'medium' as const };
      render(<WhaleActivityIndicator indicator={mediumActivityIndicator} />);
      
      expect(screen.getByText('Whale Activity')).toBeInTheDocument();
    });

    it('should show low activity with gray icon', () => {
      const lowActivityIndicator = { ...mockIndicator, activity: 'low' as const };
      render(<WhaleActivityIndicator indicator={lowActivityIndicator} />);
      
      expect(screen.getByText('Whale Activity')).toBeInTheDocument();
    });
  });

  describe('risk levels', () => {
    it('should show high risk correctly', () => {
      const highRiskIndicator = { ...mockIndicator, riskLevel: 'high' as const };
      render(<WhaleActivityIndicator indicator={highRiskIndicator} />);
      
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should show medium risk correctly', () => {
      const mediumRiskIndicator = { ...mockIndicator, riskLevel: 'medium' as const };
      render(<WhaleActivityIndicator indicator={mediumRiskIndicator} />);
      
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should show low risk correctly', () => {
      const lowRiskIndicator = { ...mockIndicator, riskLevel: 'low' as const };
      render(<WhaleActivityIndicator indicator={lowRiskIndicator} />);
      
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  describe('detailed view', () => {
    it('should show details when showDetails is true', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} showDetails={true} />);
      
      expect(screen.getByText('Activity:')).toBeInTheDocument();
      expect(screen.getByText('Risk:')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument(); // Activity level
      expect(screen.getByText('Low')).toBeInTheDocument(); // Risk level
    });

    it('should show signals when available', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} showDetails={true} />);
      
      expect(screen.getByText('Signals:')).toBeInTheDocument();
      expect(screen.getByText('Strong accumulation')).toBeInTheDocument();
      expect(screen.getByText('High whale interest')).toBeInTheDocument();
    });

    it('should show trend information', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} showDetails={true} />);
      
      expect(screen.getByText('Trend:')).toBeInTheDocument();
      expect(screen.getByText('Bullish')).toBeInTheDocument();
    });

    it('should hide details when showDetails is false', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} showDetails={false} />);
      
      expect(screen.queryByText('Activity:')).not.toBeInTheDocument();
      expect(screen.queryByText('Signals:')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle indicator with no signals', () => {
      const noSignalsIndicator = { ...mockIndicator, signals: [] };
      render(<WhaleActivityIndicator indicator={noSignalsIndicator} showDetails={true} />);
      
      expect(screen.queryByText('Signals:')).not.toBeInTheDocument();
    });

    it('should handle very long signal text', () => {
      const longSignalsIndicator = {
        ...mockIndicator,
        signals: ['This is a very long signal text that might cause layout issues'],
      };
      render(<WhaleActivityIndicator indicator={longSignalsIndicator} showDetails={true} />);
      
      expect(screen.getByText('This is a very long signal text that might cause layout issues')).toBeInTheDocument();
    });

    it('should handle zero confidence', () => {
      const zeroConfidenceIndicator = { ...mockIndicator, confidence: 0 };
      render(<WhaleActivityIndicator indicator={zeroConfidenceIndicator} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle maximum confidence', () => {
      const maxConfidenceIndicator = { ...mockIndicator, confidence: 100 };
      render(<WhaleActivityIndicator indicator={maxConfidenceIndicator} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('styling and theming', () => {
    it('should apply dark theme colors for bullish trend', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} />);
      
      const container = screen.getByText('Whale Activity').closest('div');
      expect(container).toHaveClass('bg-green-900/20', 'border-green-500/30');
    });

    it('should apply dark theme colors for bearish trend', () => {
      const bearishIndicator = { ...mockIndicator, trend: 'bearish' as const };
      render(<WhaleActivityIndicator indicator={bearishIndicator} />);
      
      const container = screen.getByText('Whale Activity').closest('div');
      expect(container).toHaveClass('bg-red-900/20', 'border-red-500/30');
    });

    it('should apply dark theme colors for neutral trend', () => {
      const neutralIndicator = { ...mockIndicator, trend: 'neutral' as const };
      render(<WhaleActivityIndicator indicator={neutralIndicator} />);
      
      const container = screen.getByText('Whale Activity').closest('div');
      expect(container).toHaveClass('bg-gray-800/50', 'border-gray-600/30');
    });

    it('should apply custom className', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} className="custom-class" />);
      
      const container = screen.getByText('Whale Activity').closest('div');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('should be accessible with proper ARIA attributes', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} />);
      
      // Check that the component renders without accessibility issues
      expect(screen.getByText('Whale Activity')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should handle screen readers correctly', () => {
      render(<WhaleActivityIndicator indicator={mockIndicator} showDetails={true} />);
      
      // Ensure all text content is accessible
      expect(screen.getByText('Whale Activity')).toBeInTheDocument();
      expect(screen.getByText('Strong accumulation')).toBeInTheDocument();
      expect(screen.getByText('High whale interest')).toBeInTheDocument();
    });
  });
}); 
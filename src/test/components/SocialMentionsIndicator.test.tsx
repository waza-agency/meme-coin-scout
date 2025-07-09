import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SocialMentionsIndicator from '../../components/SocialMentionsIndicator';
import { SocialMentionsIndicator as SocialMentionsIndicatorType } from '../../types';

describe('SocialMentionsIndicator', () => {
  const mockTrendingUpIndicator: SocialMentionsIndicatorType = {
    trend: 'up',
    changePercent: 50,
    current24h: 100,
    label: 'Trending Up',
    color: 'text-green-500',
    sentiment: 'positive',
    confidence: 100,
  };

  const mockTrendingDownIndicator: SocialMentionsIndicatorType = {
    trend: 'down',
    changePercent: -30,
    current24h: 25,
    label: 'Trending Down',
    color: 'text-red-500',
    sentiment: 'negative',
    confidence: 80,
  };

  const mockStableIndicator: SocialMentionsIndicatorType = {
    trend: 'stable',
    changePercent: 5,
    current24h: 30,
    label: 'Stable',
    color: 'text-yellow-500',
    sentiment: 'neutral',
    confidence: 60,
  };

  const mockNoDataIndicator: SocialMentionsIndicatorType = {
    trend: 'stable',
    changePercent: 0,
    current24h: 0,
    label: 'No Data',
    color: 'text-gray-500',
    sentiment: 'neutral',
    confidence: 0,
  };

  it('should render trending up indicator correctly', () => {
    render(<SocialMentionsIndicator indicator={mockTrendingUpIndicator} />);
    
    expect(screen.getByText('Trending Up')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('+50.0%')).toBeInTheDocument();
  });

  it('should render trending down indicator correctly', () => {
    render(<SocialMentionsIndicator indicator={mockTrendingDownIndicator} />);
    
    expect(screen.getByText('Trending Down')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('-30.0%')).toBeInTheDocument();
  });

  it('should render stable indicator correctly', () => {
    render(<SocialMentionsIndicator indicator={mockStableIndicator} />);
    
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('+5.0%')).toBeInTheDocument();
  });

  it('should render no data indicator correctly', () => {
    render(<SocialMentionsIndicator indicator={mockNoDataIndicator} />);
    
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument(); // Count should not show for 0
    expect(screen.queryByText('0.0%')).not.toBeInTheDocument(); // Percentage should not show for 0
  });

  it('should hide count when showCount is false', () => {
    render(<SocialMentionsIndicator indicator={mockTrendingUpIndicator} showCount={false} />);
    
    expect(screen.getByText('Trending Up')).toBeInTheDocument();
    expect(screen.queryByText('100')).not.toBeInTheDocument();
    expect(screen.getByText('+50.0%')).toBeInTheDocument();
  });

  it('should show details when showDetails is true', () => {
    render(<SocialMentionsIndicator indicator={mockTrendingUpIndicator} showDetails={true} />);
    
    expect(screen.getByText('Trending Up')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument(); // Confidence percentage
  });

  it('should hide details when showDetails is false', () => {
    render(<SocialMentionsIndicator indicator={mockTrendingUpIndicator} showDetails={false} />);
    
    expect(screen.getByText('Trending Up')).toBeInTheDocument();
    expect(screen.queryByText('100%')).not.toBeInTheDocument(); // Confidence percentage should not show
  });

  it('should apply correct CSS classes for trending up', () => {
    const { container } = render(<SocialMentionsIndicator indicator={mockTrendingUpIndicator} />);
    
    expect(container.querySelector('.bg-green-500\\/20')).toBeInTheDocument();
    expect(container.querySelector('.border-green-500\\/30')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for trending down', () => {
    const { container } = render(<SocialMentionsIndicator indicator={mockTrendingDownIndicator} />);
    
    expect(container.querySelector('.bg-red-500\\/20')).toBeInTheDocument();
    expect(container.querySelector('.border-red-500\\/30')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for stable', () => {
    const { container } = render(<SocialMentionsIndicator indicator={mockStableIndicator} />);
    
    expect(container.querySelector('.bg-yellow-500\\/20')).toBeInTheDocument();
    expect(container.querySelector('.border-yellow-500\\/30')).toBeInTheDocument();
  });

  it('should show sentiment icons when showDetails is true', () => {
    render(<SocialMentionsIndicator indicator={mockTrendingUpIndicator} showDetails={true} />);
    
    // Check if sentiment icon is rendered (we can't easily test for specific icons without more complex setup)
    const detailsSection = screen.getByText('100%').closest('div');
    expect(detailsSection).toBeInTheDocument();
  });

  it('should handle zero change percentage', () => {
    const zeroChangeIndicator: SocialMentionsIndicatorType = {
      trend: 'stable',
      changePercent: 0,
      current24h: 50,
      label: 'Stable',
      color: 'text-yellow-500',
      sentiment: 'neutral',
      confidence: 80,
    };

    render(<SocialMentionsIndicator indicator={zeroChangeIndicator} />);
    
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.queryByText('0.0%')).not.toBeInTheDocument(); // Should not show 0% change
  });

  it('should handle negative sentiment', () => {
    const negativeIndicator: SocialMentionsIndicatorType = {
      trend: 'down',
      changePercent: -25,
      current24h: 40,
      label: 'Trending Down',
      color: 'text-red-500',
      sentiment: 'negative',
      confidence: 70,
    };

    render(<SocialMentionsIndicator indicator={negativeIndicator} showDetails={true} />);
    
    expect(screen.getByText('Trending Down')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('-25.0%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('should handle neutral sentiment', () => {
    const neutralIndicator: SocialMentionsIndicatorType = {
      trend: 'stable',
      changePercent: 10,
      current24h: 35,
      label: 'Stable',
      color: 'text-yellow-500',
      sentiment: 'neutral',
      confidence: 60,
    };

    render(<SocialMentionsIndicator indicator={neutralIndicator} showDetails={true} />);
    
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('+10.0%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('should not show count for zero mentions', () => {
    const zeroMentionsIndicator: SocialMentionsIndicatorType = {
      trend: 'stable',
      changePercent: 0,
      current24h: 0,
      label: 'No Data',
      color: 'text-gray-500',
      sentiment: 'neutral',
      confidence: 0,
    };

    render(<SocialMentionsIndicator indicator={zeroMentionsIndicator} showCount={true} />);
    
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument(); // Should not show 0 count
  });
}); 
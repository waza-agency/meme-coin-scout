import { describe, it, expect } from 'vitest';
import { calculateSocialMentionsIndicator, formatSocialMentionsChange } from '../../utils/indicators';
import { SocialMentionsData } from '../../types';

describe('Social Mentions Indicators', () => {
  describe('calculateSocialMentionsIndicator', () => {
    it('should return no data indicator when socialData is null', () => {
      const result = calculateSocialMentionsIndicator(null);

      expect(result).toEqual({
        trend: 'stable',
        changePercent: 0,
        current24h: 0,
        label: 'No Data',
        color: 'text-gray-500',
        sentiment: 'neutral',
        confidence: 0,
      });
    });

    it('should calculate trending up indicator correctly', () => {
      const socialData: SocialMentionsData = {
        current24h: 100,
        previous24h: 50,
        change: 50,
        changePercent: 100,
        sentiment: {
          positive: 80,
          negative: 10,
          neutral: 10,
        },
        totalReach: 10000,
        topMentions: [],
      };

      const result = calculateSocialMentionsIndicator(socialData);

      expect(result.trend).toBe('up');
      expect(result.label).toBe('Trending Up');
      expect(result.color).toBe('text-green-500');
      expect(result.sentiment).toBe('positive');
      expect(result.confidence).toBe(100);
      expect(result.changePercent).toBe(100);
      expect(result.current24h).toBe(100);
    });

    it('should calculate trending down indicator correctly', () => {
      const socialData: SocialMentionsData = {
        current24h: 25,
        previous24h: 100,
        change: -75,
        changePercent: -75,
        sentiment: {
          positive: 5,
          negative: 15,
          neutral: 5,
        },
        totalReach: 1000,
        topMentions: [],
      };

      const result = calculateSocialMentionsIndicator(socialData);

      expect(result.trend).toBe('down');
      expect(result.label).toBe('Trending Down');
      expect(result.color).toBe('text-red-500');
      expect(result.sentiment).toBe('negative');
      expect(result.confidence).toBe(80);
      expect(result.changePercent).toBe(-75);
      expect(result.current24h).toBe(25);
    });

    it('should calculate stable indicator correctly', () => {
      const socialData: SocialMentionsData = {
        current24h: 30,
        previous24h: 35,
        change: -5,
        changePercent: -14.3,
        sentiment: {
          positive: 10,
          negative: 5,
          neutral: 15,
        },
        totalReach: 3000,
        topMentions: [],
      };

      const result = calculateSocialMentionsIndicator(socialData);

      expect(result.trend).toBe('stable');
      expect(result.label).toBe('Stable');
      expect(result.color).toBe('text-yellow-500');
      expect(result.sentiment).toBe('neutral');
      expect(result.confidence).toBe(80);
      expect(result.changePercent).toBe(-14.3);
      expect(result.current24h).toBe(30);
    });

    it('should determine sentiment correctly with mixed data', () => {
      const socialData: SocialMentionsData = {
        current24h: 20,
        previous24h: 15,
        change: 5,
        changePercent: 33.3,
        sentiment: {
          positive: 5,
          negative: 10,
          neutral: 5,
        },
        totalReach: 2000,
        topMentions: [],
      };

      const result = calculateSocialMentionsIndicator(socialData);

      expect(result.sentiment).toBe('negative');
      expect(result.confidence).toBe(80);
    });

    it('should handle zero sentiment totals correctly', () => {
      const socialData: SocialMentionsData = {
        current24h: 0,
        previous24h: 0,
        change: 0,
        changePercent: 0,
        sentiment: {
          positive: 0,
          negative: 0,
          neutral: 0,
        },
        totalReach: 0,
        topMentions: [],
      };

      const result = calculateSocialMentionsIndicator(socialData);

      expect(result.sentiment).toBe('neutral');
      expect(result.confidence).toBe(20);
    });

    describe('confidence calculation', () => {
      it('should return 100% confidence for 50+ mentions', () => {
        const socialData: SocialMentionsData = {
          current24h: 75,
          previous24h: 50,
          change: 25,
          changePercent: 50,
          sentiment: { positive: 50, negative: 15, neutral: 10 },
          totalReach: 7500,
          topMentions: [],
        };

        const result = calculateSocialMentionsIndicator(socialData);
        expect(result.confidence).toBe(100);
      });

      it('should return 80% confidence for 20-49 mentions', () => {
        const socialData: SocialMentionsData = {
          current24h: 30,
          previous24h: 25,
          change: 5,
          changePercent: 20,
          sentiment: { positive: 20, negative: 5, neutral: 5 },
          totalReach: 3000,
          topMentions: [],
        };

        const result = calculateSocialMentionsIndicator(socialData);
        expect(result.confidence).toBe(80);
      });

      it('should return 60% confidence for 10-19 mentions', () => {
        const socialData: SocialMentionsData = {
          current24h: 15,
          previous24h: 10,
          change: 5,
          changePercent: 50,
          sentiment: { positive: 10, negative: 3, neutral: 2 },
          totalReach: 1500,
          topMentions: [],
        };

        const result = calculateSocialMentionsIndicator(socialData);
        expect(result.confidence).toBe(60);
      });

      it('should return 40% confidence for 5-9 mentions', () => {
        const socialData: SocialMentionsData = {
          current24h: 7,
          previous24h: 5,
          change: 2,
          changePercent: 40,
          sentiment: { positive: 4, negative: 2, neutral: 1 },
          totalReach: 700,
          topMentions: [],
        };

        const result = calculateSocialMentionsIndicator(socialData);
        expect(result.confidence).toBe(40);
      });

      it('should return 20% confidence for less than 5 mentions', () => {
        const socialData: SocialMentionsData = {
          current24h: 3,
          previous24h: 2,
          change: 1,
          changePercent: 50,
          sentiment: { positive: 2, negative: 1, neutral: 0 },
          totalReach: 300,
          topMentions: [],
        };

        const result = calculateSocialMentionsIndicator(socialData);
        expect(result.confidence).toBe(20);
      });
    });

    describe('sentiment determination', () => {
      it('should prioritize positive sentiment', () => {
        const socialData: SocialMentionsData = {
          current24h: 20,
          previous24h: 15,
          change: 5,
          changePercent: 33.3,
          sentiment: {
            positive: 12,
            negative: 3,
            neutral: 5,
          },
          totalReach: 2000,
          topMentions: [],
        };

        const result = calculateSocialMentionsIndicator(socialData);
        expect(result.sentiment).toBe('positive');
      });

      it('should detect negative sentiment', () => {
        const socialData: SocialMentionsData = {
          current24h: 20,
          previous24h: 15,
          change: 5,
          changePercent: 33.3,
          sentiment: {
            positive: 3,
            negative: 12,
            neutral: 5,
          },
          totalReach: 2000,
          topMentions: [],
        };

        const result = calculateSocialMentionsIndicator(socialData);
        expect(result.sentiment).toBe('negative');
      });

      it('should default to neutral for balanced sentiment', () => {
        const socialData: SocialMentionsData = {
          current24h: 15,
          previous24h: 10,
          change: 5,
          changePercent: 50,
          sentiment: {
            positive: 5,
            negative: 5,
            neutral: 5,
          },
          totalReach: 1500,
          topMentions: [],
        };

        const result = calculateSocialMentionsIndicator(socialData);
        expect(result.sentiment).toBe('neutral');
      });
    });
  });

  describe('formatSocialMentionsChange', () => {
    it('should format positive change with plus sign', () => {
      expect(formatSocialMentionsChange(25.5)).toBe('+25.5%');
      expect(formatSocialMentionsChange(100)).toBe('+100.0%');
      expect(formatSocialMentionsChange(0.1)).toBe('+0.1%');
    });

    it('should format negative change without extra minus sign', () => {
      expect(formatSocialMentionsChange(-25.5)).toBe('-25.5%');
      expect(formatSocialMentionsChange(-100)).toBe('-100.0%');
      expect(formatSocialMentionsChange(-0.1)).toBe('-0.1%');
    });

    it('should format zero change', () => {
      expect(formatSocialMentionsChange(0)).toBe('0.0%');
    });

    it('should round to one decimal place', () => {
      expect(formatSocialMentionsChange(25.666)).toBe('+25.7%');
      expect(formatSocialMentionsChange(-25.444)).toBe('-25.4%');
    });
  });
}); 
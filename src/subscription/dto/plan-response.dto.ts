export class PlanResponseDto {
  id: string;
  price: number;
  currency: string;
  priceFormatted?: string;

  duration: number;
  durationType: 'day' | 'month' | 'year';
  billingType: 'recurring' | 'one_time' | 'trial' | 'lifetime';
  trialDays?: number;

  isFree: boolean;
  isRecommended: boolean;
  discountPercentage?: number;
  order: number;

  title?: string;
  description?: string;
  features?: string[];
  badge?: string;
  ctaText?: string;
}
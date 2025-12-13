export interface PricingDetails {
  monthly?: string;
  annual?: string;
  free_tier?: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  website_url: string | null;
  logo_url: string | null;
  pricing_free: boolean;
  pricing_tier: string | null;
  pricing_details: PricingDetails | null;
  features: string[];
  use_cases: string[];
  tags: string[];
  popularity_score: number;
  last_updated: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

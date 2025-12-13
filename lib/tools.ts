import { Tool } from '@/types/tool';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

import type { PricingDetails } from '@/types/tool';

export function formatPricing(pricingDetails: PricingDetails | null | undefined): string {
  if (!pricingDetails) return 'Contact for pricing';
  
  if (pricingDetails.monthly) {
    return `$${pricingDetails.monthly}/month`;
  }
  if (pricingDetails.annual) {
    return `$${pricingDetails.annual}/year`;
  }
  if (pricingDetails.free_tier) {
    return 'Free tier available';
  }
  return 'Contact for pricing';
}

export function getCategoryColor(category: string | null): string {
  const colors: Record<string, string> = {
    'Text AI': 'bg-blue-100 text-blue-800',
    'Image AI': 'bg-purple-100 text-purple-800',
    'Video AI': 'bg-pink-100 text-pink-800',
    'Code AI': 'bg-green-100 text-green-800',
    'Audio AI': 'bg-yellow-100 text-yellow-800',
    'Productivity AI': 'bg-indigo-100 text-indigo-800',
  };
  return colors[category || ''] || 'bg-gray-100 text-gray-800';
}

export function getRelatedTools(currentTool: Tool, allTools: Tool[]): Tool[] {
  return allTools
    .filter(tool => 
      tool.id !== currentTool.id &&
      (tool.category === currentTool.category ||
       tool.tags.some(tag => currentTool.tags.includes(tag)))
    )
    .slice(0, 4);
}

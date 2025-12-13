/**
 * Utility functions for data fetching with fallback logic
 */

import type { Tool, Category } from '@/types/tool';
import { getAllTools, getAllCategories, getToolsByCategory } from './supabase';

/**
 * Fetches tools with fallback to category-based fetching if getAllTools fails
 */
export async function fetchToolsWithFallback(): Promise<{
  tools: Tool[];
  categories: Category[];
  errorMessage: string | null;
}> {
  let tools: Tool[] = [];
  let categories: Category[] = [];
  let errorMessage: string | null = null;

  try {
    // Fetch categories first
    const categoriesResult = await Promise.allSettled([getAllCategories()]);
    
    if (categoriesResult[0].status === 'fulfilled') {
      categories = categoriesResult[0].value;
    }

    // Try to fetch all tools
    try {
      tools = await getAllTools();
      if (tools.length === 0 && categories.length > 0) {
        // If getAllTools returns empty but we have categories, try fallback
        if (process.env.NODE_ENV === 'development') {
          console.log('getAllTools returned empty, trying category fallback...');
        }
        tools = await fetchToolsByCategories(categories);
        if (process.env.NODE_ENV === 'development') {
          console.log('Fallback: Fetched', tools.length, 'tools by category');
        }
      }
    } catch (toolsError: unknown) {
      const errorMsg = toolsError instanceof Error ? toolsError.message : 'Unknown error';
      if (process.env.NODE_ENV === 'development') {
        console.error('getAllTools failed, trying fallback:', errorMsg);
      }

      // Fallback: Fetch tools by category and combine
      if (categories.length > 0) {
        tools = await fetchToolsByCategories(categories);
        if (process.env.NODE_ENV === 'development') {
          console.log('Fallback: Fetched', tools.length, 'tools by category');
        }
      }

      errorMessage = errorMsg;
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error fetching data:', error);
    }
    errorMessage = errorMsg;
  }

  return { tools, categories, errorMessage };
}

/**
 * Fetches tools by iterating through categories
 */
async function fetchToolsByCategories(categories: Category[]): Promise<Tool[]> {
  const categoryTools = await Promise.all(
    categories.map(cat => getToolsByCategory(cat.name).catch(() => [] as Tool[]))
  );
  return categoryTools.flat();
}


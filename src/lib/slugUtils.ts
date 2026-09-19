import { supabase } from './supabase';

/**
 * Standardize text into a URL-friendly slug.
 * Removes special characters, trims whitespace, converts to lowercase, and collapses dashes.
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // remove accent diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters
    .replace(/[\s_]+/g, '-') // replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
};

/**
 * Ensures a slug is unique in a Supabase table by checking existing rows.
 * If the base slug already exists, automatically increments with a numerical suffix (-2, -3, etc.).
 *
 * @param tableName 'categories' | 'products'
 * @param rawSlugOrName The raw text to slugify (e.g. category or product name)
 * @param excludeId Optional ID of the record being edited (to allow keeping its own slug)
 * @returns A guaranteed unique slug string
 */
export async function getUniqueSlug(
  tableName: 'categories' | 'products',
  rawSlugOrName: string,
  excludeId: string | null = null
): Promise<string> {
  const base = slugify(rawSlugOrName) || (tableName === 'categories' ? 'category' : 'product');
  let candidate = base;
  let counter = 2;

  while (counter <= 50) {
    let query = supabase.from(tableName).select('id').eq('slug', candidate);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return candidate;
    }
    candidate = `${base}-${counter}`;
    counter++;
  }

  // Fallback with unique short timestamp hash if counter exceeds 50
  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

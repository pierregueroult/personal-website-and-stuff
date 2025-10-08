/**
 * Slugify Utility
 * 
 * Converts file names and paths to URL-friendly slugs.
 * Handles:
 * - Spaces → dashes
 * - Special characters → removed or converted
 * - Accents → normalized (é → e, ñ → n, etc.)
 * - Multiple consecutive dashes → single dash
 * - Lowercase conversion
 */

/**
 * Normalize accented characters to their base form
 * é → e, ñ → n, ü → u, etc.
 */
function normalizeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convert a string to a URL-friendly slug
 * 
 * @example
 * slugify("Mon Article Été 2024") → "mon-article-ete-2024"
 * slugify("C'est l'été!") → "cest-lete"
 * slugify("Recette #1 (très bon)") → "recette-1-tres-bon"
 */
export function slugify(text: string): string {
  return normalizeAccents(text)
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with dashes
    .replace(/[\s_]+/g, '-')
    // Remove apostrophes and quotes
    .replace(/['''"""]/g, '')
    // Replace special characters with dashes or remove them
    .replace(/[^\w-]+/g, '-')
    // Replace multiple consecutive dashes with single dash
    .replace(/-+/g, '-')
    // Remove leading and trailing dashes
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert a file path to a clean slug path
 * Handles nested directories and file extensions
 * 
 * @example
 * slugifyPath("Personnal/Sport/Mon Article.md") → "personnal/sport/mon-article"
 * slugifyPath("Projets/Portfolio 2024/index.md") → "projets/portfolio-2024/index"
 */
export function slugifyPath(filePath: string): string {
  // Remove .md extension
  const withoutExtension = filePath.replace(/\.md$/, '');
  
  // Split by directory separator
  const parts = withoutExtension.split('/');
  
  // Slugify each part
  const slugifiedParts = parts.map((part) => slugify(part));
  
  // Join back with slashes
  return slugifiedParts.join('/');
}

/**
 * Convert an asset file path to a clean URL path
 * Preserves file extension for assets
 * 
 * @example
 * slugifyAssetPath("Mon Image 2024.png") → "mon-image-2024.png"
 * slugifyAssetPath("Documents/CV François.pdf") → "documents/cv-francois.pdf"
 */
export function slugifyAssetPath(filePath: string): string {
  // Extract extension
  const lastDotIndex = filePath.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? filePath.substring(lastDotIndex) : '';
  const withoutExtension = lastDotIndex !== -1 ? filePath.substring(0, lastDotIndex) : filePath;
  
  // Split by directory separator
  const parts = withoutExtension.split('/');
  
  // Slugify each part
  const slugifiedParts = parts.map((part) => slugify(part));
  
  // Join back with slashes and add extension
  return slugifiedParts.join('/') + extension.toLowerCase();
}

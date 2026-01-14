export interface CattifyResult {
  result: any;
  replacementsCount: number;
  limitReached: boolean;
}

/**
 * Recursively replaces "dog" with "cat" in JSON objects and arrays.
 * Replaces "dog" in keys (substring replacement) and exact value matches.
 * 
 * @param data - The data to process (object, array, or primitive)
 * @param maxReplacements - Optional limit on number of replacements
 * @returns Object containing the transformed data, replacement count, and limit status
 */
export function cattifyJson(data: any, maxReplacements?: number): CattifyResult {
  let replacementsCount = 0;
  const limit = maxReplacements ?? Infinity;

  function processValue(value: any): any {
    // Handle null and undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => processValue(item));
    }

    // Handle objects
    if (typeof value === 'object') {
      const result: any = {};
      
      for (const [key, val] of Object.entries(value)) {
        // Process the key - replace "dog" with "cat"
        let newKey = key;
        if (key.includes('dog') && replacementsCount < limit) {
          // Count occurrences of "dog" in the key
          const matches = key.match(/dog/g);
          const matchCount = matches ? matches.length : 0;
          
          if (matchCount > 0) {
            newKey = key.replace(/dog/g, 'cat');
            replacementsCount += matchCount;
          }
        }

        // Process the value (even if we're at the limit, we still need to process structure)
        result[newKey] = processValue(val);
      }

      return result;
    }

    // Handle strings - replace exact match "dog" with "cat"
    if (typeof value === 'string' && value === 'dog') {
      if (replacementsCount < limit) {
        replacementsCount++;
        return 'cat';
      }
    }

    // Return primitive values as-is
    return value;
  }

  const result = processValue(data);
  const limitReached = maxReplacements !== undefined && replacementsCount >= maxReplacements;

  return {
    result,
    replacementsCount,
    limitReached,
  };
}

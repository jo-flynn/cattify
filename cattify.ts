export interface CattifyResult {
  result: any;
  replacementsCount: number;
  limitReached: boolean;
}

/**
 * Recursively replaces "dog" with "cat" in JSON objects and arrays.
 * Replaces "dog" in keys and values (substring replacement).
 * 
 * @param data - The data to process (object, array, or primitive)
 * @param limit - Optional limit on number of replacements
 * @returns Object containing the transformed data, replacement count, and limit status
 */
export function cattifyJson(data: any, limit: number): CattifyResult {
  let replacementsCount = 0;

  /**
   * Replaces "dog" with "cat" in a string, respecting the replacement limit.
   * @param str - The string to process
   * @returns The processed string
   */
  const replaceDogInString = (str: string): string => {
    if (!str.includes('dog')) {
      return str;
    }

    const matches = str.match(/dog/g);
    const matchCount = matches ? matches.length : 0;
    
    if (matchCount === 0 || replacementsCount >= limit) {
      return str;
    }

    const availableSlots = limit - replacementsCount;
    const replacementsToMake = Math.min(matchCount, availableSlots);
    
    if (replacementsToMake > 0) {
      const newString = str.replace(/dog/g, 'cat');
      replacementsCount += replacementsToMake;
      return newString;
    }

    return str;
  };

  const processValue = (value: any): any => {
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
        const newKey = replaceDogInString(key);

        // Process the value (even if we're at the limit, we still need to process structure)
        result[newKey] = processValue(val);
      }

      return result;
    }

    // Handle strings - replace "dog" substring with "cat"
    if (typeof value === 'string') {
      return replaceDogInString(value);
    }

    // Return primitive values as-is
    return value;
  }

  const result = processValue(data);
  const limitReached = replacementsCount >= limit;

  return {
    result,
    replacementsCount,
    limitReached,
  };
}

const stringSimilarity = require('string-similarity');

class Matcher {
  /**
   * Compares two standardized products and returns a confidence score (0 - 100)
   * Score > 85 is generally considered a match for identical variants.
   */
  static calculateMatchScore(prodA, prodB) {
    let score = 0;
    const maxScore = 100;
    
    // 1. BRAND CHECK (CRITICAL: 0 or 20 pts)
    // If brands are known and different, they absolutely cannot be the same product.
    if (prodA.brand !== 'Unknown' && prodB.brand !== 'Unknown') {
      if (prodA.brand.toLowerCase() !== prodB.brand.toLowerCase()) {
        return 0; // Veto match
      }
      score += 20;
    } else {
      // If one brand is unknown, give partial credit so we don't unfairly penalize,
      // but rely more heavily on name match.
      score += 10;
    }

    // 2. NAME/TITLE SIMILARITY (Up to 50 pts)
    // Using string similarity (Dice coefficient) on normalized names.
    const nameSimilarity = stringSimilarity.compareTwoStrings(prodA.name, prodB.name);
    score += (nameSimilarity * 50);

    // 3. VARIANT MATCHING (CRITICAL: 0 or 30 pts)
    // Things like storage sizes, color, etc. must match if present.
    if (prodA.variant && prodB.variant) {
      // Extract storage from variants
      const getStorage = v => (v.match(/\d+(GB|TB)/) || [])[0];
      const storageA = getStorage(prodA.variant);
      const storageB = getStorage(prodB.variant);
      
      if (storageA && storageB && storageA !== storageB) {
        // Different storage capacities mean different canonical products
        return 0; 
      }
      
      // If no conflict on storage, check overall variant similarity
      const variantSimilarity = stringSimilarity.compareTwoStrings(prodA.variant.toLowerCase(), prodB.variant.toLowerCase());
      
      if (variantSimilarity > 0.4) {
        // If variants overlap significantly, it's a huge positive signal since storage already matched
        score += 30;
      } else {
        score += 10;
      }
    } else {
      // If neither or only one has a variant string, we rely completely on the name similarity
      // We give a neutral bump to avoid penalizing items that didn't have explicitly extracted variants.
      score += 20;
    }

    return Math.min(Math.round(score), maxScore);
  }

  /**
   * Helper to determine if a score passes the canonical duplicate threshold
   */
  static isMatch(score, threshold = 80) {
    return score >= threshold;
  }
}

module.exports = Matcher;

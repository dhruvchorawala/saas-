const stringSimilarity = require('string-similarity');

class Matcher {
  static calculateMatchScore(prodA, prodB) {
    let score = 0;
    const maxScore = 100;
    
    if (prodA.brand && prodB.brand && prodA.brand !== 'Unknown' && prodB.brand !== 'Unknown') {
      if (prodA.brand.toLowerCase() !== prodB.brand.toLowerCase()) {
        return 0; 
      }
      score += 20;
    } else {
      score += 10;
    }

    const nameSimilarity = stringSimilarity.compareTwoStrings(prodA.name || '', prodB.name || '');
    score += (nameSimilarity * 50);

    if (prodA.variant && prodB.variant) {
      const getStorage = v => (v.match(/\d+(GB|TB)/) || [])[0];
      const storageA = getStorage(prodA.variant);
      const storageB = getStorage(prodB.variant);
      
      if (storageA && storageB && storageA !== storageB) {
        return 0; 
      }
      
      const variantSimilarity = stringSimilarity.compareTwoStrings(prodA.variant.toLowerCase(), prodB.variant.toLowerCase());
      
      if (variantSimilarity > 0.4) {
        score += 30;
      } else {
        score += 10;
      }
    } else {
      score += 20;
    }

    return Math.min(Math.round(score), maxScore);
  }

  static isMatch(score, threshold = 80) {
    return score >= threshold;
  }
}

module.exports = Matcher;

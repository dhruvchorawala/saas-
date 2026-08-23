const Normalizer = require('./normalization/Normalizer');
const Matcher = require('./normalization/Matcher');

const rawProduct1 = {
  productName: "Apple iPhone 15 128 GB",
  brand: "Apple Inc.",
  price: "799,00",
  currency: "usd",
  availability: "in stock",
  variant: "Midnight Black"
};

const rawProduct2 = {
  productName: "iPhone 15 - 128GB (Black)",
  brand: null, // Implicit brand extraction test
  price: 799,
  currency: "$",
  availability: "Available"
};

const rawProduct3 = {
  productName: "Samsung Galaxy S23 128GB",
  brand: "Samsung",
  price: "699.99",
  currency: "EUR"
};

const rawProduct4 = {
  productName: "Apple iPhone 15 256 GB", // Different storage
  brand: "Apple",
  price: 899
};

console.log("=== NORMALIZATION DEMO ===\n");

const stdProd1 = Normalizer.normalize(rawProduct1);
console.log("Std Product 1 (Apple):", stdProd1);

const stdProd2 = Normalizer.normalize(rawProduct2);
console.log("\nStd Product 2 (Apple Messy):", stdProd2);

const stdProd3 = Normalizer.normalize(rawProduct3);
console.log("\nStd Product 3 (Samsung):", stdProd3);

const stdProd4 = Normalizer.normalize(rawProduct4);
console.log("\nStd Product 4 (Apple 256GB):", stdProd4);

console.log("\n\n=== MATCHING DEMO ===\n");

const score1v2 = Matcher.calculateMatchScore(stdProd1, stdProd2);
console.log(`Match Score [Prod 1] vs [Prod 2] (Should Match): ${score1v2}/100. Is Match? ${Matcher.isMatch(score1v2)}`);

const score1v3 = Matcher.calculateMatchScore(stdProd1, stdProd3);
console.log(`Match Score [Prod 1] vs [Prod 3] (Samsung - Should Fail): ${score1v3}/100. Is Match? ${Matcher.isMatch(score1v3)}`);

const score1v4 = Matcher.calculateMatchScore(stdProd1, stdProd4);
console.log(`Match Score [Prod 1] vs [Prod 4] (Different Storage - Should Fail): ${score1v4}/100. Is Match? ${Matcher.isMatch(score1v4)}`);

const SellerComparisonService = require('./services/sellerComparisonService');

// Mock Products mimicking a database fetch
const targetProduct = {
  _id: 'prod1',
  name: 'Apple iPhone 15 128GB',
  brand: 'Apple',
  variant: '128GB Midnight',
  seller: 'Amazon Retail',
  sourceId: { domain: 'amazon.com' },
  currentPrice: 50000,
  deliveryCharge: 0,
  discount: '0',
  availability: 'IN_STOCK'
};

const allProducts = [
  targetProduct, // Target itself
  {
    _id: 'prod2',
    name: 'iPhone 15 - 128gb (black)',
    brand: 'Apple',
    variant: '128GB Black',
    seller: 'Appario Retail',
    sourceId: { domain: 'amazon.in' },
    currentPrice: 48999,
    deliveryCharge: 499, // Final = 49498
    discount: '0',
    availability: 'IN_STOCK'
  },
  {
    _id: 'prod3',
    name: 'Apple iPhone 15 128 GB',
    brand: 'Apple',
    variant: '128 GB',
    seller: 'BestBuy Online',
    sourceId: { domain: 'bestbuy.com' },
    currentPrice: 51000,
    deliveryCharge: 0, // Final = 51000
    discount: '0',
    availability: 'IN_STOCK'
  },
  {
    _id: 'prod4',
    name: 'Apple iPhone 15 256 GB', // Different variant, should be excluded
    brand: 'Apple',
    variant: '256GB',
    seller: 'Target',
    sourceId: { domain: 'target.com' },
    currentPrice: 40000,
    deliveryCharge: 0,
    discount: '0',
    availability: 'IN_STOCK'
  },
  {
    _id: 'prod5',
    name: 'Apple iPhone 15 128GB',
    brand: 'Apple',
    variant: '128GB',
    seller: 'Walmart',
    sourceId: { domain: 'walmart.com' },
    currentPrice: 45000,
    deliveryCharge: null, // Unknown delivery charge (Final = 45000 but flagged)
    discount: '5%', // Discount calculated: 45000 - 2250 = 42750
    availability: 'OUT_OF_STOCK' // Ranks lower despite cheap price
  }
];

async function runTest() {
  console.log('--- Seller Comparison Engine Test ---\n');
  const rankedSellers = await SellerComparisonService.compareSellers(targetProduct, allProducts);
  
  console.log(`Found ${rankedSellers.length} valid competitors (including target).\n`);
  
  rankedSellers.forEach(c => {
    console.log(`[Rank ${c.rank}] ${c.isCheapest ? '⭐ ' : ''}${c.seller} (${c.source})`);
    console.log(`  - Listed Price: ₹${c.listedPrice}`);
    console.log(`  - Discount: -₹${c.discount}`);
    console.log(`  - Delivery: ${c.isDeliveryChargeKnown ? '₹' + c.deliveryCharge : 'UNKNOWN (Checkout charges may apply)'}`);
    console.log(`  - Estimated Final Price: ₹${c.estimatedFinalPrice}`);
    console.log(`  - Availability: ${c.availability}`);
    console.log(`  - Match Score: ${c.matchScore}/100\n`);
  });
}

runTest();

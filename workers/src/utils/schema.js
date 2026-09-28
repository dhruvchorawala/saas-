const { z } = require('zod');

// Schema for raw product data extracted by scrapers
const rawProductSchema = z.object({
  productName: z.string().nullable().default('Unknown Product').transform(v => v === '' ? 'Unknown Product' : (v || 'Unknown Product')),
  brand: z.string().nullable().default(null),
  image: z.string().nullable().default(null).transform(v => v === '' ? null : v),
  price: z.number().nullable().default(null),
  mrp: z.number().nullable().default(null),
  discount: z.string().nullable().default(null),
  currency: z.string().nullable().default(null),
  seller: z.string().nullable().default(null),
  variant: z.string().nullable().default(null),
  availability: z.string().nullable().default(null),
  deliveryCharge: z.number().nullable().default(null),
  estimatedDeliveryDate: z.string().nullable().default(null),
  url: z.string().url().catch(''),
  source: z.string(),
  scrapedAt: z.date().default(() => new Date()),
});

module.exports = {
  rawProductSchema
};

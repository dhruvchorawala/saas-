const { buildProfile, matchListing, titleHead } = require('../services/matcher');
const { describeQuery, describeTitle, productKey } = require('../services/discoveryService');

const matches = (product, title) => matchListing(buildProfile(product), title).ok;

describe('matcher: smartphones', () => {
  const iphone16 = { brand: 'Apple', name: 'iPhone 16', variant: '128GB' };

  it('matches the same model from every store title format', () => {
    expect(matches(iphone16, 'iPhone 16 128 GB: 5G Mobile Phone with Camera Control, A18 Chip')).toBe(true); // Amazon
    expect(matches(iphone16, 'Apple iPhone 16 (Ultramarine, 128 GB)')).toBe(true); // Flipkart
    expect(matches(iphone16, 'Apple iPhone 16 128GB Black')).toBe(true); // Reliance Digital
    expect(matches(iphone16, 'Apple iPhone 16 (128GB Storage, Pink)')).toBe(true); // Vijay Sales
  });

  it('rejects other models of the same family', () => {
    expect(matches(iphone16, 'Apple iPhone 16 Pro (Desert Titanium, 128 GB)')).toBe(false);
    expect(matches(iphone16, 'Apple iPhone 16 Plus (Black, 128 GB)')).toBe(false);
    expect(matches(iphone16, 'Apple iPhone 16e 128 GB: Built for Apple Intelligence')).toBe(false);
    expect(matches(iphone16, 'Apple iPhone 15 (Black, 128 GB)')).toBe(false);
  });

  it('rejects a different storage variant but ignores RAM', () => {
    expect(matches(iphone16, 'Apple iPhone 16 (Black, 256 GB)')).toBe(false);
    const s24 = { brand: 'Samsung', name: 'Galaxy S24', variant: '128GB' };
    expect(matches(s24, 'Samsung Galaxy S24 5G AI Smartphone (Marble Gray, 8GB, 128GB Storage)')).toBe(true);
    expect(matches(s24, 'Samsung Galaxy S24 5G (Onyx Black, 8GB, 256GB Storage)')).toBe(false);
    expect(matches(s24, 'Samsung Galaxy S24 FE 5G (Blue, 8GB, 128GB Storage)')).toBe(false);
  });

  it('rejects accessories, refurbished units and other brands', () => {
    expect(matches(iphone16, 'Spigen Ultra Hybrid Back Cover Case for iPhone 16 128GB')).toBe(false);
    expect(matches(iphone16, 'Tempered Glass Screen Protector for Apple iPhone 16')).toBe(false);
    expect(matches(iphone16, '(Refurbished) Apple iPhone 16, 128GB, Black')).toBe(false);
    const oneplus15 = { brand: 'OnePlus', name: 'OnePlus 15', variant: '256GB' };
    expect(matches(oneplus15, 'OnePlus 15 | 12GB+256GB | Infinite Black')).toBe(true);
    expect(matches(oneplus15, 'iQOO 15 (Alpha, 12 GB RAM, 256 GB Storage)')).toBe(false);
  });

  it('handles bracketed model names', () => {
    const phone3a = { brand: 'Nothing', name: 'Phone (3a)', variant: '128GB' };
    expect(matches(phone3a, 'Nothing Phone (3a) 5G (Black, 8GB RAM, 128GB Storage)')).toBe(true);
    expect(matches(phone3a, 'Nothing Phone (3a) Pro 5G (Grey, 8GB RAM, 128GB Storage)')).toBe(false);
    expect(matches(phone3a, 'Nothing Phone (3a Lite) (Black, 128 GB) (8 GB RAM)')).toBe(false);
    expect(titleHead('Nothing Phone (3a) Pro (8GB)').replace(/\s+/g, ' ').trim()).toBe('Nothing Phone 3a Pro');
  });
});

describe('matcher: other categories', () => {
  it('matches laptops on RAM and SSD together', () => {
    const air = { brand: 'Apple', name: 'MacBook Air M4 13-inch', variant: '16GB 256GB' };
    expect(matches(air, 'Apple 2025 MacBook Air (13-inch, Apple M4 chip with 10-core CPU and 8-core GPU, 16GB Unified Memory, 256GB) - Sky Blue')).toBe(true);
    expect(matches(air, 'Apple MacBook Air M4 - (16 GB/256 GB SSD/macOS Sequoia) MW123HN/A (13.6 Inch, Sky Blue, 1.24 Kg)')).toBe(true);
    expect(matches(air, 'Apple 2025 MacBook Air (13-inch, Apple M4 chip, 16GB Unified Memory, 512GB) - Midnight')).toBe(false);
    expect(matches(air, 'Apple 2024 MacBook Pro (14-inch, Apple M4 chip, 16GB, 512GB) - Space Black')).toBe(false);
  });

  it('matches audio products and tolerates joined/split model names', () => {
    const xm5 = { brand: 'Sony', name: 'WH-1000XM5', variant: '' };
    expect(matches(xm5, 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones')).toBe(true);
    expect(matches(xm5, 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones')).toBe(false);
    expect(matches(xm5, 'Replacement Ear Pads Cushion for Sony WH-1000XM5')).toBe(false);
    const buds = { brand: 'Samsung', name: 'Galaxy Buds3 Pro', variant: '' };
    expect(matches(buds, 'Samsung Galaxy Buds 3 Pro (Silver)')).toBe(true);
    expect(matches(buds, 'Samsung Galaxy Buds3 (Silver)')).toBe(false);
  });

  it('keeps watch listings that mention case/band after the model', () => {
    const watch = { brand: 'Apple', name: 'Watch Series 10 GPS', variant: '46mm' };
    expect(matches(watch, 'Apple Watch Series 10 [GPS 46 mm] Smartwatch with Jet Black Aluminium Case with Black Sport Band')).toBe(true);
    expect(matches(watch, 'Apple Watch Series 10 [GPS + Cellular 46 mm] Smartwatch')).toBe(false);
    expect(matches(watch, 'Apple Watch Series 10 [GPS 42 mm] Smartwatch')).toBe(false);
    expect(matches(watch, 'Sport Band Strap for Apple Watch Series 10 46mm')).toBe(false);
  });

  it('rejects store display units and spec numbers posing as model numbers', () => {
    const watch11 = { brand: 'Apple', name: 'Watch Series 11 GPS', variant: '46mm' };
    expect(matches(watch11, 'Store Display Unit - Apple Watch Series 11 GPS 46mm Space Grey Aluminium Case')).toBe(false);
    const pad3 = { brand: 'OnePlus', name: 'Pad 3', variant: '256GB' };
    expect(matches(pad3, 'OnePlus Pad 3 33.52 cm (13.2 inch) 12 GB RAM, 256 GB, Frosted Silver, Wi-Fi Tablet')).toBe(true);
    expect(matches(pad3, 'OnePlus Pad 2 12 GB RAM 256 GB ROM 12.1 inch with Wi-Fi Only Gaming Qualcomm Snapdragon 8 Gen 3')).toBe(false);
    expect(matches(pad3, 'OnePlus Pad 4 (13.2" (33.53 cm) 3.4K Display | Snapdragon 8 Elite Gen 5 | 8GB RAM + 256GB')).toBe(false);
    const air = { brand: 'Apple', name: 'MacBook Air M5 13-inch', variant: '16GB 512GB' };
    expect(matches(air, 'Apple MacBook Air M5 Chip (16GB RAM/ 512GB SSD/ 13 Inch Liquid Retina Display/ 10-core CPU)')).toBe(true);
  });

  it('keeps Wi-Fi tablets apart from their 5G versions', () => {
    const tab = { brand: 'Samsung', name: 'Galaxy Tab S10 FE Wi-Fi', variant: '128GB' };
    expect(matches(tab, 'Samsung Galaxy Tab S10 FE, S Pen in-Box, 27.7 cm (10.9 inch), 8GB RAM, 128GB Storage')).toBe(true);
    expect(matches(tab, 'Samsung Galaxy Tab S10 FE | 27.70 cm | Wi-Fi + 5G | 8GB RAM | 128GB Storage')).toBe(false);
  });

  it('treats generic words as optional for free-text user searches only', () => {
    const userQuery = { brand: 'Sony', name: 'WH-1000XM5 headphones', variant: '', origin: 'USER' };
    expect(matches(userQuery, 'Sony WH-1000XM5 Bluetooth Headset')).toBe(true);
    const catalog = { brand: 'Nothing', name: 'Phone (3)', variant: '256GB' };
    expect(matches(catalog, 'Nothing Ear (3) with Super Mic, 256GB')).toBe(false);
  });
});

describe('discovery helpers', () => {
  it('parses a free-text query into brand, name and storage variant', () => {
    expect(describeQuery('samsung galaxy s24 256gb')).toEqual({ brand: 'Samsung', name: 'galaxy s24', variant: '256GB' });
    expect(describeQuery('Sony WH-1000XM5')).toEqual({ brand: 'Sony', name: 'WH-1000XM5', variant: '' });
  });

  it('shortens a store title into a searchable product', () => {
    expect(describeTitle('Apple iPhone 15 (Blue, 128 GB)')).toEqual({ brand: 'Apple', name: 'iPhone 15', variant: '128GB' });
    expect(describeTitle('Buy Apple iPhone 15 128GB Yellow Online')).toEqual({ brand: 'Apple', name: 'iPhone 15', variant: '128GB' });
    expect(describeTitle('Samsung Galaxy S24 5G AI Smartphone (Marble Gray, 8GB, 128GB Storage)'))
      .toEqual({ brand: 'Samsung', name: 'Galaxy S24', variant: '128GB' });
  });

  it('builds the same key regardless of word order or case', () => {
    expect(productKey('Apple', 'iPhone 15', '128GB')).toBe(productKey(null, 'apple iphone 15', '128gb'));
  });
});

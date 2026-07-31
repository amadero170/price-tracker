// Reference product from the Fester price table
export interface ReferenceProduct {
  idh: string;
  name: string;
  referencePrice: number;
  category: string;
  // Mapping to imper-x.com Shopify product
  imperX: {
    productId: number;
    variantId: number;
    variantTitle: string;
    handle: string;
  } | null;
  // Casa Myers product URL
  casaMyersUrl?: string | null;
}

// A monitored site
export interface Site {
  id: string;
  name: string;
  url: string;
  active: boolean;
  logoUrl?: string;
}

// A price fetched from a site for a reference product
export interface PriceResult {
  idh: string;
  productName: string;
  referencePrice: number;
  category: string;
  sitePrice: number | null; // null if not found on site
  sitePriceFormatted: string;
  referencePriceFormatted: string;
  priceDifference: number | null; // percentage difference
  belowReference: boolean; // true = price is BELOW reference (alert!)
  inStock: boolean;
  productUrl: string | null;
  lastUpdated: string;
}

// Grouped results by site for the accordion view
export interface SitePriceGroup {
  site: Site;
  results: PriceResult[];
  alertCount: number; // number of products below reference price
  matchedCount: number; // number of products found on this site
  totalProducts: number; // total reference products
  averageDifference: number | null; // average % difference
}

// API response
export interface PricesApiResponse {
  sites: SitePriceGroup[];
  lastUpdated: string;
  totalAlerts: number;
  totalProducts: number;
}

// Raw Shopify product from imper-x.com API
export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string | null;
  available: boolean;
  product_id: number;
}

export interface ShopifyImage {
  id: number;
  src: string;
  width: number;
  height: number;
}

export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

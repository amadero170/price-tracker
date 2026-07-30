import { NextResponse } from "next/server";
import { referenceProducts } from "@/data/reference-products";
import { sites } from "@/data/sites";
import type {
  PriceResult,
  SitePriceGroup,
  PricesApiResponse,
  ShopifyProductsResponse,
  ShopifyVariant,
} from "@/types";
import fs from "fs";
import path from "path";

// Force dynamic rendering (no caching on Vercel)
export const dynamic = "force-dynamic";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(price);
}

async function fetchImperXProducts(): Promise<ShopifyProductsResponse | null> {
  try {
    // Try live fetch first (works in production/Vercel)
    const res = await fetch(
      "https://imper-x.com/products.json?limit=250&page=1",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (res.ok) {
      return (await res.json()) as ShopifyProductsResponse;
    }
  } catch {
    // Live fetch failed, try fallback
  }

  // Fallback: read from local JSON file (for development)
  try {
    const filePath = path.join(process.cwd(), "imper-x-raw.json");
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as ShopifyProductsResponse;
  } catch {
    return null;
  }
}

function buildImperXPrices(
  shopifyData: ShopifyProductsResponse | null
): Map<number, ShopifyVariant> {
  const variantMap = new Map<number, ShopifyVariant>();

  if (!shopifyData) return variantMap;

  for (const product of shopifyData.products) {
    for (const variant of product.variants) {
      variantMap.set(variant.id, variant);
    }
  }

  return variantMap;
}

export async function GET() {
  const shopifyData = await fetchImperXProducts();
  const variantMap = buildImperXPrices(shopifyData);
  const now = new Date().toISOString();

  const siteGroups: SitePriceGroup[] = [];

  for (const site of sites) {
    if (site.id === "imper-x") {
      // Active site: match reference products to imper-x variants
      const results: PriceResult[] = [];
      let alertCount = 0;
      let matchedCount = 0;
      let totalDiff = 0;
      let diffCount = 0;

      for (const product of referenceProducts) {
        if (!product.imperX) {
          // Product not available on this site
          results.push({
            idh: product.idh,
            productName: product.name,
            referencePrice: product.referencePrice,
            category: product.category,
            sitePrice: null,
            sitePriceFormatted: "No disponible",
            referencePriceFormatted: formatPrice(product.referencePrice),
            priceDifference: null,
            belowReference: false,
            inStock: false,
            productUrl: null,
            lastUpdated: now,
          });
          continue;
        }

        const variant = variantMap.get(product.imperX.variantId);

        if (variant) {
          const sitePrice = parseFloat(variant.price);
          const diff =
            ((sitePrice - product.referencePrice) / product.referencePrice) *
            100;
          const below = sitePrice < product.referencePrice;

          if (below) alertCount++;
          matchedCount++;
          totalDiff += diff;
          diffCount++;

          results.push({
            idh: product.idh,
            productName: product.name,
            referencePrice: product.referencePrice,
            category: product.category,
            sitePrice,
            sitePriceFormatted: formatPrice(sitePrice),
            referencePriceFormatted: formatPrice(product.referencePrice),
            priceDifference: Math.round(diff * 10) / 10,
            belowReference: below,
            inStock: variant.available,
            productUrl: `https://imper-x.com/products/${product.imperX.handle}`,
            lastUpdated: now,
          });
        } else {
          results.push({
            idh: product.idh,
            productName: product.name,
            referencePrice: product.referencePrice,
            category: product.category,
            sitePrice: null,
            sitePriceFormatted: "No encontrado",
            referencePriceFormatted: formatPrice(product.referencePrice),
            priceDifference: null,
            belowReference: false,
            inStock: false,
            productUrl: null,
            lastUpdated: now,
          });
        }
      }

      siteGroups.push({
        site,
        results,
        alertCount,
        matchedCount,
        totalProducts: referenceProducts.length,
        averageDifference:
          diffCount > 0 ? Math.round((totalDiff / diffCount) * 10) / 10 : null,
      });
    } else {
      // Inactive sites: no data
      siteGroups.push({
        site,
        results: [],
        alertCount: 0,
        matchedCount: 0,
        totalProducts: referenceProducts.length,
        averageDifference: null,
      });
    }
  }

  const totalAlerts = siteGroups.reduce((sum, g) => sum + g.alertCount, 0);

  const response: PricesApiResponse = {
    sites: siteGroups,
    lastUpdated: now,
    totalAlerts,
    totalProducts: referenceProducts.length,
  };

  return NextResponse.json(response);
}

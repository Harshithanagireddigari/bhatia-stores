export type ProductMeasurement = {
  dimensions: string; // e.g. "60 cm (L) × 60 cm (W) × 1 cm (Thickness)"
  shortDimensions: string; // e.g. "60 × 60 × 1 cm"
  coverage?: string; // e.g. "1 tile = 0.36 sq.m (approx.)"
  material: string; // e.g. "Vitrified Ceramic"
  finish: string; // e.g. "Glossy Mirror Finish"
};

export function getProductMeasurements(productName: string, category: string = ""): ProductMeasurement {
  const nameLower = productName.toLowerCase();
  const catLower = category.toLowerCase();

  if (nameLower.includes("marble") || nameLower.includes("pgvt") || nameLower.includes("tile") || catLower.includes("tile")) {
    if (nameLower.includes("80") || nameLower.includes("800")) {
      return {
        dimensions: "80 cm (L) × 80 cm (W) × 1.2 cm (Thickness)",
        shortDimensions: "80 × 80 × 1.2 cm",
        coverage: "1 tile = 0.64 sq.m (approx.)",
        material: "Glazed Vitrified Tile (PGVT)",
        finish: "High Gloss Polish",
      };
    }
    if (nameLower.includes("120") || nameLower.includes("slab")) {
      return {
        dimensions: "120 cm (L) × 60 cm (W) × 1.2 cm (Thickness)",
        shortDimensions: "120 × 60 × 1.2 cm",
        coverage: "1 tile = 0.72 sq.m (approx.)",
        material: "Double Charge Vitrified",
        finish: "Polished Marble Finish",
      };
    }
    return {
      dimensions: "60 cm (L) × 60 cm (W) × 1 cm (Thickness)",
      shortDimensions: "60 × 60 × 1 cm",
      coverage: "1 tile = 0.36 sq.m (approx.)",
      material: "Vitrified Ceramic",
      finish: "Glossy Mirror Finish",
    };
  }

  if (nameLower.includes("basin") || nameLower.includes("tap") || nameLower.includes("faucet") || catLower.includes("sanitary")) {
    if (nameLower.includes("basin") || nameLower.includes("sink")) {
      return {
        dimensions: "45 cm (L) × 35 cm (W) × 15 cm (H)",
        shortDimensions: "45 × 35 × 15 cm",
        material: "High-Fired Glazed Ceramic",
        finish: "Pure White Glossy",
      };
    }
    return {
      dimensions: "15 cm (L) × 8 cm (W) × 18 cm (H)",
      shortDimensions: "15 × 8 × 18 cm",
      material: "Solid Lead-Free Brass",
      finish: "Matte Gold / Chrome PVD",
    };
  }

  return {
    dimensions: "60 cm (L) × 60 cm (W) × 1 cm (Thickness)",
    shortDimensions: "60 × 60 × 1 cm",
    coverage: "Standard coverage size",
    material: "Premium Grade Material",
    finish: "Luxury Finish",
  };
}

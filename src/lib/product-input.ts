import { httpsUrl, intValue, moneyValue, optionalText, requiredText, ValidationError } from "@/lib/security/validation";

/**
 * Product input handling, shared by create and update so the two can never
 * drift apart. Prices are re-derived from the request only after being forced
 * through `moneyValue`, and stock is range-checked here rather than trusting
 * the admin form.
 */

export type ProductInput = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
};

export const MAX_ITEMS_PER_REQUEST = 50;

function allowedImageHosts(): string[] {
  const configured = (process.env.IMAGE_ALLOWED_HOSTS ?? "res.cloudinary.com")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return configured;
}

/** Accepts a Cloudinary HTTPS URL or one of our own catalogue paths. */
function productImage(value: unknown): string {
  if (typeof value === "string" && /^\/products\/[A-Za-z0-9._/-]+$/.test(value.trim())) {
    return value.trim();
  }
  return httpsUrl(value, { field: "Image", allowedHosts: allowedImageHosts() });
}

export function parseProductInput(body: Record<string, unknown>, { partial = false }: { partial?: boolean } = {}): Partial<ProductInput> {
  const input: Partial<ProductInput> = {};

  if (!partial || body.name !== undefined) input.name = requiredText(body.name, { field: "Name", max: 120 });
  if (!partial || body.description !== undefined) input.description = requiredText(body.description, { field: "Description", max: 2000 });
  if (!partial || body.price !== undefined) input.price = moneyValue(body.price, { field: "Price" });
  if (!partial || body.image !== undefined) input.image = productImage(body.image);
  if (!partial || body.category !== undefined) input.category = requiredText(body.category, { field: "Category", max: 60 });
  if (body.stock !== undefined) input.stock = intValue(body.stock, { field: "Stock", min: 0, max: 1_000_000 });
  else if (!partial) input.stock = 0;

  return input;
}

/** Normalises an incoming cart line, throwing on anything unusable. */
export function parseCartQuantity(value: unknown, availableStock: number): number {
  const quantity = typeof value === "string" ? Number(value) : value;
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    throw new ValidationError("Invalid cart quantity");
  }
  if (quantity > availableStock) throw new ValidationError("Requested quantity exceeds available stock");
  return quantity;
}

export function parseOptionalNote(value: unknown) {
  return optionalText(value, { field: "Note", max: 500 });
}

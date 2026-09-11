CREATE TABLE IF NOT EXISTS "hero_slides" (
  "id" text PRIMARY KEY NOT NULL,
  "image_url" text NOT NULL,
  "image_public_id" text,
  "eyebrow" text DEFAULT 'Bhatia Stores' NOT NULL,
  "heading" text NOT NULL,
  "accent" text NOT NULL,
  "description" text NOT NULL,
  "is_active" integer DEFAULT 1 NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

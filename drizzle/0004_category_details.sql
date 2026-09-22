-- Safely extends installations where the initial categories table already exists.
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "slug" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description" text DEFAULT '' NOT NULL;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "display_on_homepage" integer DEFAULT 1 NOT NULL;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "display_in_shop" integer DEFAULT 1 NOT NULL;

UPDATE "categories"
SET "slug" = lower(regexp_replace(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_unique" ON "categories" ("slug");

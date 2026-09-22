CREATE TABLE IF NOT EXISTS "categories" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL UNIQUE,
  "slug" text NOT NULL UNIQUE,
  "image" text,
  "description" text DEFAULT '' NOT NULL,
  "is_visible" integer DEFAULT 1 NOT NULL,
  "display_on_homepage" integer DEFAULT 1 NOT NULL,
  "display_in_shop" integer DEFAULT 1 NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "offers" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "code" text UNIQUE,
  "discount_type" text DEFAULT 'percent' NOT NULL,
  "discount_value" numeric(10, 2) NOT NULL,
  "expires_at" timestamp,
  "is_active" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "store_settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

import { db } from "./index";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function ensureDatabaseTables() {
  try {
    // 1. Types
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('admin', 'customer');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 2. Users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        phone text,
        password text NOT NULL,
        role role NOT NULL DEFAULT 'customer',
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 3. Products table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id text PRIMARY KEY,
        name text NOT NULL,
        description text NOT NULL,
        price numeric(10, 2) NOT NULL,
        image text NOT NULL,
        images jsonb,
        category text NOT NULL,
        stock integer NOT NULL DEFAULT 0,
        dimensions text,
        finish text,
        material text,
        rating numeric(3, 1) DEFAULT 4.8,
        featured integer DEFAULT 0,
        is_popular integer DEFAULT 0,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 4. Orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id),
        customer_name text NOT NULL,
        customer_email text NOT NULL,
        address text NOT NULL,
        locality text,
        city text NOT NULL,
        state text,
        pincode text,
        phone text NOT NULL,
        status order_status NOT NULL DEFAULT 'pending',
        total numeric(10, 2) NOT NULL,
        subtotal numeric(10, 2),
        shipping_fee numeric(10, 2) DEFAULT 0.00,
        discount numeric(10, 2) DEFAULT 0.00,
        payment_method text DEFAULT 'prepaid' NOT NULL,
        razorpay_payment_id text,
        razorpay_order_id text,
        tracking_number text,
        notes text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 5. Order Items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id text PRIMARY KEY,
        order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id text NOT NULL REFERENCES products(id),
        product_name text NOT NULL,
        product_image text,
        quantity integer NOT NULL DEFAULT 1,
        price numeric(10, 2) NOT NULL
      );
    `);

    // 6. Sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamp NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 7. Payment orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payment_orders (
        id text PRIMARY KEY,
        razorpay_order_id text NOT NULL UNIQUE,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount_paise integer NOT NULL,
        currency text NOT NULL,
        items jsonb NOT NULL,
        status text DEFAULT 'created' NOT NULL,
        razorpay_payment_id text UNIQUE,
        expires_at timestamp NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 8. Rate limits
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key text PRIMARY KEY,
        count integer NOT NULL,
        reset_at timestamp NOT NULL
      );
    `);

    // 9. Addresses
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS addresses (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name text NOT NULL,
        phone text NOT NULL,
        street text NOT NULL,
        apartment text,
        locality text,
        city text NOT NULL,
        state text NOT NULL,
        pincode text NOT NULL,
        is_default integer DEFAULT 0 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 10. Wishlists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 11. Settings
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        key text PRIMARY KEY,
        value text NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 12. Launchpad slides
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS launchpad_slides (
        id text PRIMARY KEY,
        title text NOT NULL,
        subtitle text NOT NULL,
        eyebrow text NOT NULL,
        cta_text text NOT NULL DEFAULT 'Explore Products',
        cta_link text NOT NULL DEFAULT '/shop',
        image text NOT NULL,
        active integer DEFAULT 1 NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 13. Launchpad banners
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS launchpad_banners (
        id text PRIMARY KEY,
        title text NOT NULL,
        subtitle text,
        code text,
        discount_percent integer,
        active integer DEFAULT 1 NOT NULL,
        link text DEFAULT '/shop',
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 14. Password reset tokens
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token text NOT NULL UNIQUE,
        expires_at timestamp NOT NULL,
        used integer DEFAULT 0 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 15. Contact submissions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        phone text,
        subject text,
        message text NOT NULL,
        status text DEFAULT 'unread' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 16. Uploaded images
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS uploaded_images (
        id text PRIMARY KEY,
        filename text NOT NULL,
        original_name text NOT NULL,
        url text NOT NULL,
        mime_type text NOT NULL,
        size integer NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // Auto-seed default store settings if missing
    await seedInitialData();
  } catch (error) {
    console.error("Database initialization warning:", error);
  }
}

async function seedInitialData() {
  // Check if admin user exists
  const existingUsers = await db.execute(sql`SELECT id FROM users LIMIT 1;`);
  if (!existingUsers.rows || existingUsers.rows.length === 0) {
    const adminPass = await bcrypt.hash("Admin@Bhatia2026", 12);
    const userPass = await bcrypt.hash("Customer@2026", 12);

    await db.execute(sql`
      INSERT INTO users (id, name, email, phone, password, role) VALUES
      (${uuidv4()}, 'Bhatia Stores Admin', 'admin@bhatia.com', '+91 99849 79720', ${adminPass}, 'admin'),
      (${uuidv4()}, 'Rajesh Verma', 'customer@example.com', '+91 98765 43210', ${userPass}, 'customer');
    `);
  }

  // Check if default settings exist
  const existingSettings = await db.execute(sql`SELECT key FROM settings WHERE key = 'cod_enabled' LIMIT 1;`);
  if (!existingSettings.rows || existingSettings.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO settings (key, value) VALUES
      ('cod_enabled', 'true'),
      ('free_shipping_threshold', '5000'),
      ('standard_shipping_fee', '299'),
      ('store_phone', '+91 99849 79720'),
      ('store_email', 'contact@bhatiastores.com'),
      ('store_whatsapp', '919984979720'),
      ('store_address', 'Bhatia Sanitary & Tiles Showroom, Main Ring Road, Industrial Area, Sector 4, India'),
      ('business_hours', 'Mon - Sat: 9:30 AM - 8:30 PM | Sunday: 10:30 AM - 6:00 PM');
    `);
  }

  // Check if Launchpad slides exist
  const existingSlides = await db.execute(sql`SELECT id FROM launchpad_slides LIMIT 1;`);
  if (!existingSlides.rows || existingSlides.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO launchpad_slides (id, title, subtitle, eyebrow, cta_text, cta_link, image, active, sort_order) VALUES
      (${uuidv4()}, 'Architectural Tile Perfection', 'Explore curated large-format PGVT glazed porcelain slabs, bespoke Italian designs, and artisanal wall ceramics crafted for elevated living spaces.', 'The 2026 Surface Edit', 'Explore Products', '/shop', '/products/new-stock/pgvt-01.jpg', 1, 1),
      (${uuidv4()}, 'Luxury Double Charge & Vitrified', 'Engineered for enduring strength, high foot traffic, and timeless elegance with mirror gloss and satin matte finishes.', 'High-Performance Flooring', 'View Vitrified Tiles', '/shop?category=Double+Charge', '/products/new-stock/gnam-dc-01.jpg', 1, 2),
      (${uuidv4()}, 'Artisanal Italian Sanitaryware', 'Transform bathrooms with designer rimless WC suites, brushed gold brassware, and sculptured vanity wash basins.', 'Sanitaryware & Faucets', 'Explore Sanitaryware', '/shop?category=Sanitaryware+%26+Faucets', '/products/catalog/hindware-01.jpg', 1, 3);
    `);
  }

  // Check if Launchpad banners exist
  const existingBanners = await db.execute(sql`SELECT id FROM launchpad_banners LIMIT 1;`);
  if (!existingBanners.rows || existingBanners.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO launchpad_banners (id, title, subtitle, code, discount_percent, active, link) VALUES
      (${uuidv4()}, 'Exclusive Showroom Offer', 'Get 10% off your first tile & sanitaryware order with code', 'BHATIA10', 10, 1, '/shop');
    `);
  }

  // Check if products exist
  const existingProducts = await db.execute(sql`SELECT id FROM products LIMIT 1;`);
  if (!existingProducts.rows || existingProducts.rows.length === 0) {
    await seedCuratedTileProducts();
  }
}

async function seedCuratedTileProducts() {
  const curated = [
    // PGVT Vitrified Slabs
    {
      name: "PGVT Calacatta Gold Glossy Slab 600x1200",
      description: "Grand 600x1200 mm polished glazed vitrified tile (PGVT) featuring authentic Italian Calacatta gold veining. Ultra-low water absorption (<0.05%), mirror-polish glaze, and high stain resistance for luxury living rooms and master suites.",
      price: "1350.00",
      image: "/products/new-stock/pgvt-01.jpg",
      images: JSON.stringify(["/products/new-stock/pgvt-01.jpg", "/products/new-stock/pgvt-02.jpg", "/products/new-stock/pgvt-03.jpg"]),
      category: "Vitrified Floor Tiles",
      stock: 120,
      dimensions: "600 x 1200 mm",
      finish: "High Gloss Polished (PGVT)",
      material: "Glazed Vitrified Porcelain",
      rating: "4.9",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "PGVT Statuario Venato Endless Tile 600x1200",
      description: "Endless pattern continuous vein PGVT vitrified tile in crisp white Statuario marble motif. Precision rectified edges for seamless minimal grout joint installation.",
      price: "1420.00",
      image: "/products/new-stock/pgvt-02.jpg",
      images: JSON.stringify(["/products/new-stock/pgvt-02.jpg", "/products/new-stock/pgvt-04.jpg"]),
      category: "Vitrified Floor Tiles",
      stock: 85,
      dimensions: "600 x 1200 mm",
      finish: "Endless Bookmatch High Gloss",
      material: "Glazed Vitrified Porcelain",
      rating: "4.9",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "PGVT Royal Nero Marquina 600x1200",
      description: "Dramatic obsidian black marble vitrified slab accented with stark white lightning veins. Scratch-proof nano coating and supreme visual depth.",
      price: "1480.00",
      image: "/products/new-stock/pgvt-03.jpg",
      images: JSON.stringify(["/products/new-stock/pgvt-03.jpg", "/products/new-stock/pgvt-05.jpg"]),
      category: "Vitrified Floor Tiles",
      stock: 60,
      dimensions: "600 x 1200 mm",
      finish: "Deep Polish High Gloss",
      material: "Glazed Vitrified Porcelain",
      rating: "4.8",
      featured: 1,
      isPopular: 0,
    },
    {
      name: "PGVT Armani Bronze Luxury Slab 600x1200",
      description: "Warm tobacco and caramel bronze tone glazed vitrified tile. Ideal for accent floors, hotel lobbies, and opulent living spaces.",
      price: "1390.00",
      image: "/products/new-stock/pgvt-04.jpg",
      images: JSON.stringify(["/products/new-stock/pgvt-04.jpg", "/products/new-stock/pgvt-06.jpg"]),
      category: "Vitrified Floor Tiles",
      stock: 75,
      dimensions: "600 x 1200 mm",
      finish: "Silk Polish Gloss",
      material: "Glazed Vitrified Porcelain",
      rating: "4.7",
      featured: 0,
      isPopular: 1,
    },
    // Double Charge Vitrified
    {
      name: "SunCore Matrix Double Charge 600x600 - Opal Ivory",
      description: "Heavy-duty double-layer vitrified tile with a 3-4mm wear layer engineered for maximum abrasion resistance. Perfect for high-traffic corridors, commercial projects, and residential halls.",
      price: "1650.00",
      image: "/products/new-stock/gnam-dc-01.jpg",
      images: JSON.stringify(["/products/new-stock/gnam-dc-01.jpg", "/products/new-stock/gnam-dc-02.jpg"]),
      category: "Double Charge",
      stock: 250,
      dimensions: "600 x 600 mm",
      finish: "Double Charge Mirror Polished",
      material: "Full Vitrified Body",
      rating: "4.9",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "SunCore Matrix Light DC 600x600 - Crystal Beige",
      description: "Pristine micro-crystal double-charge tile featuring subtle granular micro-motifs. Anti-bacterial surface treatment and zero porosity.",
      price: "1680.00",
      image: "/products/new-stock/gnam-dc-02.jpg",
      images: JSON.stringify(["/products/new-stock/gnam-dc-02.jpg", "/products/new-stock/gnam-dc-03.jpg"]),
      category: "Double Charge",
      stock: 190,
      dimensions: "600 x 600 mm",
      finish: "Double Charge Vitrified Gloss",
      material: "Full Vitrified Body",
      rating: "4.8",
      featured: 0,
      isPopular: 1,
    },
    {
      name: "SunCore Matrix Light DC 600x600 - Crema Marfil",
      description: "Warm Spanish crema beige vitrified double-charge tile with natural depth. Non-fading pigments and heavy load bearing strength.",
      price: "1620.00",
      image: "/products/new-stock/gnam-dc-03.jpg",
      images: JSON.stringify(["/products/new-stock/gnam-dc-03.jpg", "/products/new-stock/gnam-dc-04.jpg"]),
      category: "Double Charge",
      stock: 140,
      dimensions: "600 x 600 mm",
      finish: "Double Charge Mirror Polished",
      material: "Full Vitrified Body",
      rating: "4.7",
      featured: 0,
      isPopular: 0,
    },
    // Satin Matt & NCT Porcelain
    {
      name: "NCT Satin Matt Nordic Ash Porcelain 600x600",
      description: "Modern tactile satin-matt porcelain tile with subtle concrete and stone texture. Anti-skid R9 rating, pleasant soft touch, perfect for contemporary kitchens and bathrooms.",
      price: "1500.00",
      image: "/products/catalog/suncore-matt-01.jpg",
      images: JSON.stringify(["/products/catalog/suncore-matt-01.jpg", "/products/catalog/suncore-matt-02.jpg"]),
      category: "Satin Matt",
      stock: 110,
      dimensions: "600 x 600 mm",
      finish: "Satin Matt Smooth",
      material: "Porcelain Ceramic",
      rating: "4.8",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "NCT Satin Matt Concrete Grey 600x600",
      description: "Industrial minimalist grey satin porcelain tile. Scratch resistant, chemical resistant, easy to maintain.",
      price: "1520.00",
      image: "/products/catalog/suncore-matt-04.jpg",
      images: JSON.stringify(["/products/catalog/suncore-matt-04.jpg", "/products/catalog/suncore-matt-05.jpg"]),
      category: "Satin Matt",
      stock: 95,
      dimensions: "600 x 600 mm",
      finish: "Satin Matt Anti-Slip",
      material: "Porcelain Ceramic",
      rating: "4.7",
      featured: 0,
      isPopular: 0,
    },
    // Wall Tiles (G-NAM Digital Wall)
    {
      name: "G-NAM Premium Digital Wall Tile 300x450 - Moroccan Teal Motif",
      description: "High-definition digital ceramic wall tile featuring intricate geometric Moroccan motifs. Glossy water-repellent protective glaze for designer bathroom walls and kitchen splashbacks.",
      price: "720.00",
      image: "/products/catalog/gnam-wall-01.jpg",
      images: JSON.stringify(["/products/catalog/gnam-wall-01.jpg", "/products/catalog/gnam-wall-02.jpg", "/products/catalog/gnam-wall-03.jpg"]),
      category: "Digital Wall Tiles",
      stock: 180,
      dimensions: "300 x 450 mm",
      finish: "Glossy Digital Ceramic",
      material: "Ceramic Wall Body",
      rating: "4.9",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "G-NAM Designer Carving Wall Tile 300x450 - Fluted Beige",
      description: "Architectural fluted 3D texture wall tile. Adds tactile elegance and acoustic softness to shower enclosures and powder rooms.",
      price: "750.00",
      image: "/products/catalog/gnam-wall-05.jpg",
      images: JSON.stringify(["/products/catalog/gnam-wall-05.jpg", "/products/catalog/gnam-wall-06.jpg"]),
      category: "Digital Wall Tiles",
      stock: 140,
      dimensions: "300 x 450 mm",
      finish: "Carving 3D Textured",
      material: "Ceramic Wall Body",
      rating: "4.8",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "G-NAM Glossy Wave Highlighter 300x450",
      description: "Modern organic wave pattern ceramic wall tile with metallic luster accents.",
      price: "690.00",
      image: "/products/catalog/gnam-wall-09.jpg",
      images: JSON.stringify(["/products/catalog/gnam-wall-09.jpg", "/products/catalog/gnam-wall-10.jpg"]),
      category: "Digital Wall Tiles",
      stock: 160,
      dimensions: "300 x 450 mm",
      finish: "Luster Gloss Highlighter",
      material: "Ceramic Wall Body",
      rating: "4.7",
      featured: 0,
      isPopular: 0,
    },
    // Step & Riser Tiles
    {
      name: "Matt Step & Riser Bullnose Stair Tile Set",
      description: "Complete monolithic stair step and riser system with grooved safety tread lines and full bullnose rounded front edge. Eliminates hazardous sharp edges on staircases.",
      price: "480.00",
      image: "/products/catalog/step-riser-01.jpg",
      images: JSON.stringify(["/products/catalog/step-riser-01.jpg", "/products/catalog/step-riser-02.jpg", "/products/catalog/step-riser-03.jpg"]),
      category: "Step & Riser",
      stock: 130,
      dimensions: "1200 x 300 mm (Step) + 1200 x 200 mm (Riser)",
      finish: "Matt Anti-Skid Bullnose",
      material: "Heavy Duty Vitrified",
      rating: "4.8",
      featured: 1,
      isPopular: 0,
    },
    {
      name: "Step & Riser Granito Charcoal Staircase Tile",
      description: "Granite-look anti-skid step and riser tile pair engineered for outdoor verandas, internal staircases, and duplex residences.",
      price: "520.00",
      image: "/products/catalog/step-riser-05.jpg",
      images: JSON.stringify(["/products/catalog/step-riser-05.jpg", "/products/catalog/step-riser-06.jpg"]),
      category: "Step & Riser",
      stock: 90,
      dimensions: "1200 x 300 mm (Step) + 1200 x 200 mm (Riser)",
      finish: "Rough Matt Anti-Skid",
      material: "Heavy Duty Vitrified",
      rating: "4.7",
      featured: 0,
      isPopular: 1,
    },
    // Hindware Italian Sanitaryware & Faucets
    {
      name: "Hindware Italian Rimless Wall-Hung WC with Soft Close",
      description: "Sculpted Italian collection wall-hung toilet suite featuring 360-degree rimless tornado flush technology, nano anti-bacterial glaze, and UF slim soft-closing seat cover.",
      price: "8990.00",
      image: "/products/catalog/hindware-01.jpg",
      images: JSON.stringify(["/products/catalog/hindware-01.jpg", "/products/catalog/hindware-02.jpg", "/products/catalog/hindware-03.jpg"]),
      category: "Sanitaryware & Faucets",
      stock: 45,
      dimensions: "530 x 360 x 360 mm",
      finish: "Alpine White Ceramic Glaze",
      material: "Vitreous China",
      rating: "4.9",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "Hindware Italian Sculpted Countertop Art Basin",
      description: "Curved oval vessel countertop wash basin with slim profile rim and stain-resistant glaze. Perfect centerpiece for luxury vanity counters.",
      price: "4850.00",
      image: "/products/catalog/hindware-04.jpg",
      images: JSON.stringify(["/products/catalog/hindware-04.jpg", "/products/catalog/hindware-05.jpg"]),
      category: "Sanitaryware & Faucets",
      stock: 55,
      dimensions: "600 x 400 x 140 mm",
      finish: "Gloss Ceramic White",
      material: "Vitreous China",
      rating: "4.8",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "Hindware Italian Brushed Gold Tall Basin Mixer Faucet",
      description: "Solid brass body single-lever tall basin faucet with PVD brushed gold corrosion-resistant finish. High-flow aerator with water-saving stream.",
      price: "4200.00",
      image: "/products/catalog/hindware-07.jpg",
      images: JSON.stringify(["/products/catalog/hindware-07.jpg", "/products/catalog/hindware-08.jpg"]),
      category: "Sanitaryware & Faucets",
      stock: 40,
      dimensions: "Standard Tall Basin",
      finish: "PVD Brushed Gold",
      material: "Solid Brass & Ceramic Cartridge",
      rating: "4.9",
      featured: 1,
      isPopular: 1,
    },
    {
      name: "Hindware Italian Matte Black Diverter Concealed Shower Set",
      description: "Concealed 3-outlet thermostatic shower diverter with 12-inch stainless steel rain shower head and handheld spray in velvety matte black electroplated finish.",
      price: "9450.00",
      image: "/products/catalog/hindware-11.jpg",
      images: JSON.stringify(["/products/catalog/hindware-11.jpg", "/products/catalog/hindware-12.jpg"]),
      category: "Sanitaryware & Faucets",
      stock: 30,
      dimensions: "12-Inch Overhead Shower + Diverter",
      finish: "Matte Black Electroplated",
      material: "Solid Brass + SUS304",
      rating: "4.9",
      featured: 0,
      isPopular: 1,
    },
  ];

  for (const item of curated) {
    const id = uuidv4();
    await db.execute(sql`
      INSERT INTO products (
        id, name, description, price, image, images, category, stock,
        dimensions, finish, material, rating, featured, is_popular
      ) VALUES (
        ${id}, ${item.name}, ${item.description}, ${item.price}, ${item.image},
        ${item.images}::jsonb, ${item.category}, ${item.stock},
        ${item.dimensions}, ${item.finish}, ${item.material}, ${item.rating},
        ${item.featured}, ${item.isPopular}
      );
    `);
  }
}

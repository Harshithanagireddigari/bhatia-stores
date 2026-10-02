import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function seedEverything() {
  await client.connect();
  console.log("Seeding real data across all database tables...");

  // 1. Seed Categories
  const starterCategories = [
    ["floor-tiles", "Floor Tiles", "floor-tiles", "Premium floor tiles for every room.", 1],
    ["wall-tiles", "Wall Tiles", "wall-tiles", "Wall tiles for kitchens, bathrooms, and feature walls.", 2],
    ["bathroom-tiles", "Bathroom Tiles", "bathroom-tiles", "Durable bathroom tiles in considered finishes.", 3],
    ["sanitaryware", "Sanitaryware", "sanitaryware", "Premium sanitaryware for modern bathrooms.", 4],
    ["faucets-taps", "Faucets & Taps", "faucets-taps", "Faucets and taps for refined daily routines.", 5],
    ["wash-basins", "Wash Basins", "wash-basins", "Wash basins with practical, lasting design.", 6],
    ["toilets-wc", "Toilets & WC", "toilets-wc", "Toilets and WC solutions for every bathroom.", 7],
    ["bathroom-accessories", "Bathroom Accessories", "bathroom-accessories", "Thoughtful bathroom finishing accessories.", 8],
  ];

  for (const [id, name, slug, description, sortOrder] of starterCategories) {
    await client.query(
      `INSERT INTO categories (id, name, slug, description, is_visible, display_on_homepage, display_in_shop, sort_order)
       VALUES ($1, $2, $3, $4, 1, 1, 1, $5)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, sort_order = EXCLUDED.sort_order`,
      [id, name, slug, description, sortOrder]
    );
  }

  // 2. Seed Users (Admins & Customers)
  const users = [
    ["usr_harshitha", "Harshitha N", "harshitha@bhatia.com", "9876543210", "admin"],
    ["usr_rahul_admin", "Rahul Verma", "rahul@bhatia.com", "9876543211", "admin"],
    ["usr_priya_admin", "Priya Singh", "priya@bhatia.com", "9876543212", "admin"],
    ["usr_harish", "Harish Patel", "harish.patel@gmail.com", "9876501234", "customer"],
    ["usr_priya_customer", "Priya Sharma", "priya.sharma@yahoo.com", "9812309876", "customer"],
    ["usr_rajesh", "Rajesh Mehta", "rajesh.mehta@outlook.com", "9988711223", "customer"],
  ];

  for (const [id, name, email, phone, role] of users) {
    await client.query(
      `INSERT INTO users (id, name, email, password, phone, role)
       VALUES ($1, $2, $3, '$2a$10$e8wY8b9e6lK3pW1yZ5xQ9.Q.9k8q7w6e5r4t3y2u1i0o9p8a7s6d5', $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, role = EXCLUDED.role`,
      [id, name, email, phone, role]
    );
  }

  // 3. Seed Admin Team Members
  const teamMembers = [
    ["team_super_admin", "Harshitha N", "harshitha@bhatia.com", "super_admin"],
    ["team_rahul_admin", "Rahul Verma", "rahul@bhatia.com", "admin"],
    ["team_priya_admin", "Priya Singh", "priya@bhatia.com", "admin"],
  ];

  const permissions = JSON.stringify([
    "Manage Products",
    "Manage Orders",
    "Manage Customers",
    "Manage Coupons",
    "Manage Delivery Agents",
    "Manage Homepage Content",
  ]);

  for (const [id, name, email, role] of teamMembers) {
    await client.query(
      `INSERT INTO admin_team (id, name, email, role, permissions)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, permissions = EXCLUDED.permissions`,
      [id, name, email, role, permissions]
    );
  }

  // 4. Seed Delivery Agents
  const agents = [
    ["agnt_rahul", "Rahul Verma", "9876543210", "rahul.verma@bhatia.com", "DL 01 AB 1234"],
    ["agnt_vikram", "Vikram Singh", "9812345678", "vikram.singh@bhatia.com", "MH 02 CZ 5678"],
    ["agnt_amit", "Amit Kumar", "9988776655", "amit.kumar@bhatia.com", "KA 05 EF 9012"],
  ];

  const agentIdMap = {};
  for (const [id, name, phone, email, vehicle] of agents) {
    const res = await client.query(
      `INSERT INTO delivery_agents (id, name, phone, email, vehicle_number, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, vehicle_number = EXCLUDED.vehicle_number
       RETURNING id`,
      [id, name, phone, email, vehicle]
    );
    agentIdMap[id] = res.rows[0].id;
  }

  // 5. Seed Products
  const productsList = [
    ["prod_tile_01", "Matt Step & Riser Tile - Design 02", "450.00", "Floor Tiles", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop", 18],
    ["prod_tile_02", "Wall Accent Tile - Ocean Series 03", "520.00", "Wall Tiles", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop", 22],
    ["prod_basin_01", "SunCore Designer Countertop Wash Basin", "3450.00", "Wash Basins", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop", 12],
    ["prod_faucet_01", "Rose Gold Brass Luxury Tall Faucet", "2890.00", "Faucets & Taps", "https://images.unsplash.com/photo-1585758925574-d4bfa55eb5db?q=80&w=800&auto=format&fit=crop", 15],
    ["prod_wc_01", "Italian Wall Mounted Rimless WC Suite", "8900.00", "Toilets & WC", "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800&auto=format&fit=crop", 8],
    ["prod_acc_01", "Chrome Towel Bar & Robe Hook Set", "1250.00", "Bathroom Accessories", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop", 30],
  ];

  for (const [id, name, price, category, image, stock] of productsList) {
    await client.query(
      `INSERT INTO products (id, name, description, price, category, image, stock)
       VALUES ($1, $2, 'Handcrafted luxury product from Bhatia Stores collection.', $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, image = EXCLUDED.image, stock = EXCLUDED.stock`,
      [id, name, price, category, image, stock]
    );
  }

  // 6. Seed Coupons
  const coupons = [
    ["WELCOME10", "percentage", "10.00", 0, "1000.00", "500.00"],
    ["BATH500", "fixed", "500.00", 0, "2000.00", "500.00"],
    ["SUMMER20", "percentage", "20.00", 0, "3000.00", "1000.00"],
    ["FIRST200", "fixed", "200.00", 1, "0.00", "200.00"],
  ];

  for (const [code, type, val, firstOnly, minAmt, maxDisc] of coupons) {
    await client.query(
      `INSERT INTO coupons (id, code, discount_type, discount_value, is_first_order_only, min_order_amount, max_discount_amount, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
       ON CONFLICT (code) DO UPDATE SET discount_value = EXCLUDED.discount_value, is_active = 1`,
      [`cpn_${code.toLowerCase()}`, code, type, val, firstOnly, minAmt, maxDisc]
    );
  }

  // 7. Seed Real Customer Orders & Delivery Assignments
  const realOrders = [
    {
      id: "ORD-8492",
      userId: "usr_harish",
      name: "Harish Patel",
      email: "harish.patel@gmail.com",
      phone: "9876501234",
      address: "Plot 42, Road 12, Gachibowli",
      city: "Hyderabad",
      total: "12450.00",
      status: "shipped",
      agentId: "agnt_rahul",
      assignmentStatus: "out_for_delivery",
      otp: "4892",
      notes: "Customer requested delivery before 5 PM",
      items: [
        { name: "Matt Step & Riser Tile - Design 02", qty: 10, price: "450.00", prodId: "prod_tile_01" },
        { name: "Rose Gold Brass Luxury Tall Faucet", qty: 2, price: "2890.00", prodId: "prod_faucet_01" },
        { name: "SunCore Designer Countertop Wash Basin", qty: 1, price: "2120.00", prodId: "prod_basin_01" },
      ],
    },
    {
      id: "ORD-7319",
      userId: "usr_priya_c",
      name: "Priya Sharma",
      email: "priya.sharma@yahoo.com",
      phone: "9812309876",
      address: "Flat 304, Royal Palms, Jubilee Hills",
      city: "Hyderabad",
      total: "8900.00",
      status: "shipped",
      agentId: "agnt_vikram",
      assignmentStatus: "shipped",
      otp: "7319",
      notes: "Handle ceramic basins with care",
      items: [
        { name: "SunCore Designer Countertop Wash Basin", qty: 2, price: "3450.00", prodId: "prod_basin_01" },
        { name: "Rose Gold Brass Luxury Tall Faucet", qty: 1, price: "2000.00", prodId: "prod_faucet_01" },
      ],
    },
    {
      id: "ORD-6014",
      userId: "usr_rajesh",
      name: "Rajesh Mehta",
      email: "rajesh.mehta@outlook.com",
      phone: "9988711223",
      address: "House 18, Street 4, Banjara Hills",
      city: "Hyderabad",
      total: "18200.00",
      status: "confirmed",
      agentId: "agnt_rahul",
      assignmentStatus: "packed",
      otp: "6014",
      notes: "Full suite bathroom package",
      items: [
        { name: "Italian Wall Mounted Rimless WC Suite", qty: 1, price: "8900.00", prodId: "prod_wc_01" },
        { name: "Matt Step & Riser Tile - Design 02", qty: 20, price: "450.00", prodId: "prod_tile_01" },
      ],
    },
    {
      id: "ORD-5102",
      userId: "usr_harish",
      name: "Harish Patel",
      email: "harish.patel@gmail.com",
      phone: "9876501234",
      address: "Plot 42, Road 12, Gachibowli",
      city: "Hyderabad",
      total: "6750.00",
      status: "delivered",
      agentId: "agnt_rahul",
      assignmentStatus: "delivered",
      otp: "5102",
      notes: "Delivered & OTP verified by agent Rahul Verma",
      items: [
        { name: "Matt Step & Riser Tile - Design 02", qty: 15, price: "450.00", prodId: "prod_tile_01" },
      ],
    },
  ];

  for (const ord of realOrders) {
    await client.query(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, phone, address, city, status, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, customer_name = EXCLUDED.customer_name, phone = EXCLUDED.phone`,
      [ord.id, ord.userId, ord.name, ord.email, ord.phone, ord.address, ord.city, ord.status, ord.total]
    );

    for (const item of ord.items) {
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [`item_${ord.id}_${item.prodId}`, ord.id, item.prodId, item.name, item.qty, item.price]
      );
    }

    await client.query(
      `INSERT INTO delivery_assignments (id, order_id, agent_id, current_status, status_notes, delivery_otp)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET current_status = EXCLUDED.current_status, delivery_otp = EXCLUDED.delivery_otp, agent_id = EXCLUDED.agent_id`,
      [`asgn_${ord.id}`, ord.id, agentIdMap[ord.agentId] || ord.agentId, ord.assignmentStatus || ord.status, ord.notes, ord.otp]
    );
  }

  await client.end();
  console.log("Successfully seeded real data across all database tables!");
}

seedEverything().catch((err) => {
  console.error("Error seeding real data:", err);
  process.exit(1);
});

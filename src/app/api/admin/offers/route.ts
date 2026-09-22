import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
async function admin() { return (await getSessionUser())?.role === "admin"; }
export async function GET() { if (!(await admin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); return NextResponse.json(await db.select().from(offers).orderBy(desc(offers.createdAt))); }
export async function POST(request: Request) { if (!(await admin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); const { title, code, discountType, discountValue, expiresAt } = await request.json(); if (!title || !Number(discountValue)) return NextResponse.json({ error: "Title and discount are required" }, { status: 400 }); const id = uuidv4(); await db.insert(offers).values({ id, title, code: code || null, discountType: discountType === "flat" ? "flat" : "percent", discountValue: String(discountValue), expiresAt: expiresAt ? new Date(expiresAt) : null }); return NextResponse.json({ id }, { status: 201 }); }
export async function PATCH(request: Request) { if (!(await admin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); const { id, isActive } = await request.json(); await db.update(offers).set({ isActive: isActive ? 1 : 0 }).where(eq(offers.id, id)); return NextResponse.json({ success: true }); }
export async function DELETE(request: Request) { if (!(await admin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); const { id } = await request.json(); await db.delete(offers).where(eq(offers.id, id)); return NextResponse.json({ success: true }); }

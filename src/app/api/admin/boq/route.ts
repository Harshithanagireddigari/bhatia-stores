import { NextResponse } from "next/server";
import { db } from "@/db";
import { boqRequests } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const list = await db
    .select()
    .from(boqRequests)
    .orderBy(desc(boqRequests.createdAt));

  return NextResponse.json(list);
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, status } = await req.json();

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID and status are required" },
      { status: 400 }
    );
  }

  await db
    .update(boqRequests)
    .set({ status })
    .where(eq(boqRequests.id, id));

  return NextResponse.json({ success: true });
}

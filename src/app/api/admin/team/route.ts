import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminTeam, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    let team = await db.select().from(adminTeam).orderBy(desc(adminTeam.createdAt));

    if (team.length === 0) {
      const defaultOwner = {
        id: "team_super_admin",
        name: "Harshitha N",
        email: "harshitha@bhatia.com",
        role: "super_admin",
        permissions: [
          "Manage Products",
          "Manage Orders",
          "Manage Customers",
          "Manage Coupons",
          "Manage Delivery Agents",
          "Manage Homepage Content",
        ],
      };

      await db.insert(adminTeam).values(defaultOwner).catch(() => {});
      team = [defaultOwner as any];
    }

    return NextResponse.json(Array.isArray(team) ? team : []);
  } catch (error) {
    console.error("Error fetching admin team:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, email, password, role, permissions } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, Email, and Password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Create or update user account with admin role
    const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail));
    let userId = "";

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
    } else {
      userId = `usr_${uuidv4()}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.insert(users).values({
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: "admin",
      });
    }

    // 2. Add to adminTeam table
    const teamMemberId = `team_${uuidv4()}`;
    const newTeamMember = {
      id: teamMemberId,
      name: name.trim(),
      email: cleanEmail,
      role: role || "admin",
      permissions: permissions || [
        "Manage Products",
        "Manage Orders",
        "Manage Customers",
        "Manage Coupons",
        "Manage Delivery Agents",
        "Manage Homepage Content",
      ],
    };

    await db.insert(adminTeam).values(newTeamMember);
    return NextResponse.json(newTeamMember, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json({ error: "Failed to add admin team member" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Team member ID is required" }, { status: 400 });
    }

    await db.delete(adminTeam).where(eq(adminTeam.id, id));
    return NextResponse.json({ message: "Admin removed" });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 });
  }
}

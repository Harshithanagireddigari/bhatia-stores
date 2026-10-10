import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminTeam, users } from "@/db/schema";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const team = await db.select().from(adminTeam).orderBy(desc(adminTeam.createdAt));
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

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Hash password if supplied
    let hashedPassword = "";
    if (password && password.trim().length > 0) {
      hashedPassword = await hashPassword(password.trim());
    }

    // 1. Create or update user account with admin role and new password
    const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail));
    let userId = "";

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      const updatePayload: { role: "admin" | "customer"; name: string; password?: string } = {
        role: "admin",
        name: name.trim(),
      };
      if (hashedPassword) {
        updatePayload.password = hashedPassword;
      }
      await db.update(users).set(updatePayload).where(eq(users.id, userId));
    } else {
      if (!hashedPassword) {
        return NextResponse.json({ error: "Password is required when creating a new admin account" }, { status: 400 });
      }
      userId = `usr_${uuidv4()}`;
      await db.insert(users).values({
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: "admin",
      });
    }

    // 2. Add or update adminTeam table
    const existingTeam = await db.select().from(adminTeam).where(eq(adminTeam.email, cleanEmail));
    if (existingTeam.length > 0) {
      await db.update(adminTeam).set({
        name: name.trim(),
        role: role || "admin",
        permissions: permissions || [
          "Manage Products",
          "Manage Orders",
          "Manage Customers",
          "Manage Coupons",
          "Manage Delivery Agents",
          "Manage Homepage Content",
        ],
      }).where(eq(adminTeam.id, existingTeam[0].id));

      return NextResponse.json({
        ...existingTeam[0],
        name: name.trim(),
        role: role || "admin",
        permissions,
      });
    }

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

    const member = await db.select().from(adminTeam).where(eq(adminTeam.id, id));
    if (member.length > 0) {
      // Demote role in users table to customer
      await db.update(users).set({ role: "customer" }).where(eq(users.email, member[0].email));
      await db.delete(adminTeam).where(eq(adminTeam.id, id));
    }

    return NextResponse.json({ message: "Admin removed" });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 });
  }
}

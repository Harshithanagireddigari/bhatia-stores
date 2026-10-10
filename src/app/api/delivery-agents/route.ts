import { NextResponse } from "next/server";
import { db } from "@/db";
import { deliveryAgents, deliveryAssignments, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// GET: Fetch delivery agents OR assigned orders for a delivery agent
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    if (agentId) {
      // Fetch orders assigned to this agent
      const assignments = await db
        .select({
          assignmentId: deliveryAssignments.id,
          orderId: orders.id,
          customerName: orders.customerName,
          customerEmail: orders.customerEmail,
          phone: orders.phone,
          address: orders.address,
          city: orders.city,
          total: orders.total,
          orderStatus: orders.status,
          currentStatus: deliveryAssignments.currentStatus,
          statusNotes: deliveryAssignments.statusNotes,
          proofImageUrl: deliveryAssignments.proofImageUrl,
          deliveryOtp: deliveryAssignments.deliveryOtp,
          assignedAt: deliveryAssignments.createdAt,
          updatedAt: deliveryAssignments.updatedAt,
        })
        .from(deliveryAssignments)
        .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
        .where(eq(deliveryAssignments.agentId, agentId))
        .orderBy(desc(deliveryAssignments.updatedAt));

      return NextResponse.json(Array.isArray(assignments) ? assignments : []);
    }

    // Admin view: Fetch all delivery agents
    const agents = await db.select().from(deliveryAgents).orderBy(desc(deliveryAgents.createdAt));

    return NextResponse.json(Array.isArray(agents) ? agents : []);
  } catch (error) {
    console.error("Error in delivery agents GET:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST: Add a new delivery agent OR assign an order to an agent
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, name, phone, email, vehicleNumber, orderId, agentId } = body;

    if (action === "assign_order") {
      if (!orderId || !agentId) {
        return NextResponse.json({ error: "orderId and agentId are required" }, { status: 400 });
      }

      const assignmentId = `asgn_${uuidv4()}`;
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const newAssignment = {
        id: assignmentId,
        orderId,
        agentId,
        currentStatus: "ordered",
        statusNotes: "Order assigned to delivery agent",
        deliveryOtp: generatedOtp,
        updatedAt: new Date(),
      };

      await db.insert(deliveryAssignments).values(newAssignment);
      return NextResponse.json(newAssignment, { status: 201 });
    }

    // Default action: Create new delivery agent
    if (!name || !phone || !email) {
      return NextResponse.json({ error: "Name, Phone, and Email are required" }, { status: 400 });
    }

    const agentIdNew = `agnt_${uuidv4()}`;
    const newAgent = {
      id: agentIdNew,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      vehicleNumber: vehicleNumber ? vehicleNumber.trim() : null,
      status: "active",
    };

    await db.insert(deliveryAgents).values(newAgent);
    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error("Delivery agents API error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    await db.delete(deliveryAssignments).where(eq(deliveryAssignments.agentId, id));
    await db.delete(deliveryAgents).where(eq(deliveryAgents.id, id));
    return NextResponse.json({ success: true, message: "Delivery agent removed" });
  } catch (error) {
    console.error("Delete agent error:", error);
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
  }
}

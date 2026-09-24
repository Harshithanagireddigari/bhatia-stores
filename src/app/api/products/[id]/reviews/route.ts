import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  try {
    const dbReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    const totalReviews = dbReviews.length;
    const totalRatingSum = dbReviews.reduce((sum, r) => sum + Number(r.rating), 0);
    const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    dbReviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Number(r.rating))) as 1 | 2 | 3 | 4 | 5;
      ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    });

    return NextResponse.json({
      reviews: dbReviews,
      totalReviews,
      averageRating,
      ratingCounts,
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({
      reviews: [],
      totalReviews: 0,
      averageRating: 0,
      ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  const { id: productId } = await params;

  try {
    const { rating, title, comment, name } = await req.json();

    if (!rating || !title || !comment) {
      return NextResponse.json(
        { error: "Rating, review title, and detailed feedback are required." },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Please select a rating between 1 and 5 stars." },
        { status: 400 }
      );
    }

    const reviewerName = user?.name || name?.trim() || "Verified Buyer";
    const newId = uuidv4();

    await db.insert(reviews).values({
      id: newId,
      productId,
      userId: user?.id || null,
      userName: reviewerName,
      rating: ratingNum,
      title: String(title).trim().slice(0, 120),
      comment: String(comment).trim().slice(0, 1000),
      verifiedPurchase: user ? 1 : 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your review! Your feedback has been published.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Could not save your review. Please try again." },
      { status: 500 }
    );
  }
}

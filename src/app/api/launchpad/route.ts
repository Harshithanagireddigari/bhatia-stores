import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { launchpadSlides, launchpadBanners, settings } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const slides = await db.select().from(launchpadSlides).orderBy(asc(launchpadSlides.sortOrder));
    const banners = await db.select().from(launchpadBanners).orderBy(desc(launchpadBanners.createdAt));

    // Section visibility settings
    const sectionVisibilityRecord = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "homepage_sections"))
      .limit(1);

    const defaultSections = {
      hero: true,
      banner: true,
      categories: true,
      featured: true,
      popular: true,
      sanitaryware: true,
      trust: true,
      contact: true,
    };

    let sections = defaultSections;
    if (sectionVisibilityRecord[0]) {
      try {
        sections = { ...defaultSections, ...JSON.parse(sectionVisibilityRecord[0].value) };
      } catch {
        // fallback
      }
    }

    return NextResponse.json({
      slides,
      banners,
      sections,
    });
  } catch (error) {
    console.error("Fetch launchpad error:", error);
    return NextResponse.json({ error: "Failed to fetch launchpad content" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create_slide") {
      const { title, subtitle, eyebrow, ctaText, ctaLink, image, active, sortOrder } = body;
      if (!title || !subtitle || !image) {
        return NextResponse.json({ error: "Title, subtitle, and image are required" }, { status: 400 });
      }

      const id = uuidv4();
      await db.insert(launchpadSlides).values({
        id,
        title,
        subtitle,
        eyebrow: eyebrow || "The 2026 Collection",
        ctaText: ctaText || "Explore Products",
        ctaLink: ctaLink || "/shop",
        image,
        active: active !== undefined ? (active ? 1 : 0) : 1,
        sortOrder: Number(sortOrder) || 0,
      });

      return NextResponse.json({ success: true, id });
    }

    if (action === "update_slide") {
      const { id, title, subtitle, eyebrow, ctaText, ctaLink, image, active, sortOrder } = body;
      if (!id) return NextResponse.json({ error: "Slide ID is required" }, { status: 400 });

      await db
        .update(launchpadSlides)
        .set({
          title,
          subtitle,
          eyebrow,
          ctaText,
          ctaLink,
          image,
          active: active !== undefined ? (active ? 1 : 0) : 1,
          sortOrder: Number(sortOrder) || 0,
        })
        .where(eq(launchpadSlides.id, id));

      return NextResponse.json({ success: true });
    }

    if (action === "delete_slide") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Slide ID is required" }, { status: 400 });
      await db.delete(launchpadSlides).where(eq(launchpadSlides.id, id));
      return NextResponse.json({ success: true });
    }

    if (action === "toggle_slide_active") {
      const { id, active } = body;
      if (!id) return NextResponse.json({ error: "Slide ID is required" }, { status: 400 });
      await db.update(launchpadSlides).set({ active: active ? 1 : 0 }).where(eq(launchpadSlides.id, id));
      return NextResponse.json({ success: true });
    }

    if (action === "create_banner") {
      const { title, subtitle, code, discountPercent, active, link } = body;
      if (!title) return NextResponse.json({ error: "Banner title is required" }, { status: 400 });

      const id = uuidv4();
      await db.insert(launchpadBanners).values({
        id,
        title,
        subtitle: subtitle || null,
        code: code || null,
        discountPercent: Number(discountPercent) || 0,
        active: active !== undefined ? (active ? 1 : 0) : 1,
        link: link || "/shop",
      });

      return NextResponse.json({ success: true, id });
    }

    if (action === "update_banner") {
      const { id, title, subtitle, code, discountPercent, active, link } = body;
      if (!id) return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });

      await db
        .update(launchpadBanners)
        .set({
          title,
          subtitle,
          code,
          discountPercent: Number(discountPercent) || 0,
          active: active !== undefined ? (active ? 1 : 0) : 1,
          link,
        })
        .where(eq(launchpadBanners.id, id));

      return NextResponse.json({ success: true });
    }

    if (action === "delete_banner") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
      await db.delete(launchpadBanners).where(eq(launchpadBanners.id, id));
      return NextResponse.json({ success: true });
    }

    if (action === "update_sections") {
      const { sections } = body;
      const jsonStr = JSON.stringify(sections);
      const existing = await db.select().from(settings).where(eq(settings.key, "homepage_sections")).limit(1);
      if (existing[0]) {
        await db.update(settings).set({ value: jsonStr, updatedAt: new Date() }).where(eq(settings.key, "homepage_sections"));
      } else {
        await db.insert(settings).values({ key: "homepage_sections", value: jsonStr, updatedAt: new Date() });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Launchpad mutation error:", error);
    return NextResponse.json({ error: "Failed to process launchpad request" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  const content = `User-agent: *\nDisallow: /\n`;
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

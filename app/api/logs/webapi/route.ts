import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get userId from the session
    const session = await prisma.session.findFirst({
      where: {
        expires: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.msgApiLog.findMany({
      where: {
        userId: session.user.id // Filter by current user
      },
      select: {
        id: true,
        created: true,
        type: true,
        title: true,
        content: true,
        priority: true
      },
      orderBy: {
        created: "desc",
      },
      take: 100,
    });

    return NextResponse.json(logs || []);
  } catch (error) {
    console.error("Failed to fetch Web API logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

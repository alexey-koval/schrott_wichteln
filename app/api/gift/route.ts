import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);

    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const nickname = String(body?.nickname ?? "").trim();

    const title = String(body?.title ?? "").trim();
    const wrapHintRaw = String(body?.wrapHint ?? "").trim();
    const wrapHint = wrapHintRaw ? wrapHintRaw : null;

    const description = String(body?.description ?? "").trim();

    if (!firstName || !lastName || !nickname || !title) {
        return NextResponse.json(
            { error: "firstName, lastName, nickname and title are required" },
            { status: 400 }
        );
    }

    // Create/update participant by nickname (unique)
    const participant = await prisma.participant.upsert({
        where: { nickname },
        update: { firstName, lastName },
        create: { firstName, lastName, nickname }
    });

    // Create/update gift for participant (one gift per participant)
    await prisma.gift.upsert({
        where: { ownerId: participant.id },
        update: { title, wrapHint, description },
        create: { ownerId: participant.id, title, wrapHint, description }
    });

    return NextResponse.json({ ok: true });
}
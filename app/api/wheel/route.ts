import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const who = (url.searchParams.get("who") || "").trim().toLowerCase();
    if (!who) return NextResponse.json({ error: "who required" }, { status: 400 });

    // Basic matching: username OR nickname OR firstName equals `who`
    const participant = await prisma.user.findFirst({
        where: {
            OR: [
                { username: { equals: who, mode: "insensitive" } },
                { nickname: { equals: who, mode: "insensitive" } },
                { firstName: { equals: who, mode: "insensitive" } }
            ]
        },
        include: { gift: true, assignment: true }
    });

    if (!participant) return NextResponse.json({ error: "participant not found" }, { status: 404 });
    if (!participant.gift) return NextResponse.json({ error: "participant has no gift" }, { status: 400 });
    if (participant.assignment) return NextResponse.json({ error: "participant already played" }, { status: 409 });

    const gifts = await prisma.gift.findMany({
        where: {
            assigned: false,
            NOT: { ownerId: participant.id } // exclude own gift
        },
        select: { id: true, title: true, wrapHint: true }
    });

    return NextResponse.json({
        participant: {
            id: participant.id,
            label: participant.nickname || participant.firstName || participant.username
        },
        segments: gifts.map((g) => ({
            id: g.id,
            label: g.wrapHint ? `${g.title} (${g.wrapHint})` : g.title
        }))
    });
}
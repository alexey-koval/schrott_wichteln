import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
    const body = await req.json();
    const { participantId, giftId } = body ?? {};
    if (!participantId || !giftId) {
        return NextResponse.json({ error: "participantId/giftId required" }, { status: 400 });
    }

    try {
        const assignment = await prisma.$transaction(async (tx) => {
            const p = await tx.user.findUnique({
                where: { id: participantId },
                include: { gift: true, assignment: true }
            });

            if (!p) throw new Error("participant not found");
            if (!p.gift) throw new Error("participant has no gift");
            if (p.assignment) throw new Error("participant already played");
            if (p.gift.id === giftId) throw new Error("cannot take own gift");

            const gift = await tx.gift.findUnique({ where: { id: giftId } });
            if (!gift) throw new Error("gift not found");
            if (gift.assigned) throw new Error("gift already assigned");
            if (gift.ownerId === participantId) throw new Error("cannot take own gift");

            const created = await tx.assignment.create({
                data: { receiverId: participantId, giftId },
                include: { gift: true, receiver: true }
            });

            await tx.gift.update({
                where: { id: giftId },
                data: { assigned: true, assignedAt: new Date() }
            });

            return created;
        });

        return NextResponse.json({ ok: true, assignment });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "spin failed" }, { status: 409 });
    }
}
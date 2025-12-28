import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const uid = (session as any)?.uid as string | undefined;
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { firstName, lastName, nickname, title, description, wrapHint } = body ?? {};

    if (!title || !description) {
        return NextResponse.json({ error: "title/description required" }, { status: 400 });
    }

    const user = await prisma.user.update({
        where: { id: uid },
        data: { firstName, lastName, nickname }
    });

    await prisma.gift.upsert({
        where: { ownerId: uid },
        update: { title, description, wrapHint },
        create: { ownerId: uid, title, description, wrapHint }
    });

    return NextResponse.json({ ok: true, user });
}
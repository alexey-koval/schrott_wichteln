import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    const uid = (session as any)?.uid as string | undefined;
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: uid },
        include: { gift: true, assignment: { include: { gift: true } } }
    });

    return NextResponse.json({ user });
}
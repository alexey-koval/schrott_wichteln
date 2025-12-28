import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../lib/security";

function isValidUsername(username: string) {
    return /^[a-zA-Z0-9._-]{3,32}$/.test(username);
}

function isValidPassword(password: string) {
    return password.length >= 8;
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    const username = (body?.username ?? "").trim();
    const password = body?.password ?? "";

    if (!isValidUsername(username)) {
        return NextResponse.json(
            { error: "Username must be 3-32 chars (letters/numbers/._-)" },
            { status: 400 }
        );
    }

    if (!isValidPassword(password)) {
        return NextResponse.json(
            { error: "Password must be at least 8 characters" },
            { status: 400 }
        );
    }

    // Optional: limit total users to 15
    // const total = await prisma.user.count();
    // if (total >= 15) return NextResponse.json({ error: "Registration closed" }, { status: 403 });

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
        data: { username, passwordHash }
    });

    return NextResponse.json({ ok: true });
}
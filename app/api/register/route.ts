import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../lib/security";

// Allowed: Latin letters, digits, dot, underscore, dash. Length: 3..32
function isValidUsername(username: string) {
    return /^[a-zA-Z0-9._-]{3,32}$/.test(username);
}

// Password policy: at least 8 characters
function isValidPassword(password: string) {
    return password.length >= 8;
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);

    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    // Required fields
    if (!username || !password) {
        return NextResponse.json(
            { error: "username and password are required" },
            { status: 400 }
        );
    }

    // Username validation (+ debug info)
    if (!isValidUsername(username)) {
        return NextResponse.json(
            {
                error: "Username must be 3-32 chars (letters/numbers/._-)",
                received: username,
                length: username.length,
                codePoints: Array.from(username).map((ch) => ch.codePointAt(0))
            },
            { status: 400 }
        );
    }

    // Password validation
    if (!isValidPassword(password)) {
        return NextResponse.json(
            { error: "Password must be at least 8 characters" },
            { status: 400 }
        );
    }

    // Optional: cap total users at 15
    // const total = await prisma.user.count();
    // if (total >= 15) {
    //   return NextResponse.json({ error: "Registration is closed" }, { status: 403 });
    // }

    // Unique username check
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
        return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
        );
    }

    // Create user
    const passwordHash = await hashPassword(password);

    await prisma.user.create({
        data: { username, passwordHash }
    });

    return NextResponse.json({ ok: true });
}
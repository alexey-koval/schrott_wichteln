"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Wheel, Segment } from "../components/Wheel";

type WheelResponse = {
    participant: { id: string; label: string };
    segments: Segment[];
};

export default function SantaPage() {
    const { data: session, status } = useSession();

    const [who, setWho] = useState("");
    const [participant, setParticipant] = useState<WheelResponse["participant"] | null>(null);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [statusText, setStatusText] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<Segment | null>(null);
    const [loadingWheel, setLoadingWheel] = useState(false);

    // If middleware is configured, unauth users won't reach here.
    // But we still handle the UI gracefully.
    useEffect(() => {
        if (status === "unauthenticated") {
            setStatusText("Please sign in as Santa.");
        }
    }, [status]);

    const generateWheel = async () => {
        setStatusText(null);
        setLastResult(null);
        setParticipant(null);
        setSegments([]);
        setLoadingWheel(true);

        try {
            const res = await fetch(`/api/wheel?who=${encodeURIComponent(who.trim())}`);
            const data = (await res.json()) as any;

            if (!res.ok) {
                setStatusText(data?.error || "Failed to generate wheel");
                return;
            }

            const payload = data as WheelResponse;
            setParticipant(payload.participant);
            setSegments(payload.segments);
            setStatusText(payload.segments.length ? null : "No gifts available for this participant.");
        } catch (e: any) {
            setStatusText(e?.message || "Network error");
        } finally {
            setLoadingWheel(false);
        }
    };

    const commitSpin = async (seg: Segment) => {
        if (!participant) return;

        setStatusText(null);
        setLastResult(seg);

        const res = await fetch("/api/spin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participantId: participant.id, giftId: seg.id })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setStatusText(data?.error || "Failed to save result");
            return;
        }

        setStatusText(`Done! Participant receives: ${data.assignment.gift.title}`);
    };

    return (
        <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ margin: 0 }}>🎅 Santa Console</h1>

                <div style={{ display: "flex", gap: 8 }}>
                    {session ? (
                        <button onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button>
                    ) : (
                        <button onClick={() => signIn(undefined, { callbackUrl: "/santa" })}>Sign in</button>
                    )}
                </div>
            </header>

            <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
                <h2 style={{ marginTop: 0 }}>Pick participant</h2>
                <p style={{ opacity: 0.75, marginTop: 0 }}>
                    Ask the participant to tell you their <b>username / nickname / first name</b>, type it here and generate the wheel.
                </p>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <input
                        placeholder="e.g. hotcoyc"
                        value={who}
                        onChange={(e) => setWho(e.target.value)}
                    />
                    <button onClick={generateWheel} disabled={!who.trim() || loadingWheel}>
                        {loadingWheel ? "Generating..." : "Generate wheel"}
                    </button>
                </div>

                {statusText && <div style={{ marginTop: 12 }}>{statusText}</div>}

                <style jsx>{`
          input,
          button {
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #ddd;
          }
          button {
            cursor: pointer;
          }
          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
            </section>

            <Wheel segments={segments} disabled={!participant || !segments.length} onStop={commitSpin} />

            {lastResult && (
                <section style={{ border: "1px dashed #bbb", borderRadius: 16, padding: 16 }}>
                    <b>Wheel result:</b> {lastResult.label}
                </section>
            )}
        </main>
    );
}
"use client";

import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { GiftForm } from "./components/GiftForm";
import { Wheel, Segment } from "./components/Wheel";

export default function HomePage() {
    const [me, setMe] = useState<any>(null);

    const [who, setWho] = useState("");
    const [participant, setParticipant] = useState<any>(null);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [localResult, setLocalResult] = useState<Segment | null>(null);

    useEffect(() => {
        fetch("/api/me")
            .then((r) => r.json())
            .then((d) => setMe(d.user));
    }, []);

    const loadWheel = async () => {
        setStatus(null);
        setLocalResult(null);
        setParticipant(null);
        setSegments([]);

        const res = await fetch(`/api/wheel?who=${encodeURIComponent(who)}`);
        const data = await res.json();
        if (!res.ok) {
            setStatus(data?.error || "Error");
            return;
        }

        setParticipant(data.participant);
        setSegments(data.segments);
    };

    const commitSpin = async (seg: Segment) => {
        if (!participant) return;

        setStatus(null);
        setLocalResult(seg);

        const res = await fetch("/api/spin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participantId: participant.id, giftId: seg.id })
        });

        const data = await res.json();
        if (!res.ok) {
            setStatus(data?.error || "Failed to save result");
            return;
        }

        setStatus(`Done! Participant receives: ${data.assignment.gift.title}`);
    };

    const myAssignedGift = me?.assignment?.gift;

    return (
        <main>
            <TopBar />

            <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <GiftForm initial={me} />

                    <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
                        <h2 style={{ marginTop: 0 }}>Play</h2>
                        <p style={{ opacity: 0.75, marginTop: 0 }}>
                            Type your <b>username / nickname</b> and generate the wheel (your own gift + already assigned gifts are excluded).
                        </p>

                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <input placeholder="e.g. user7 or alex" value={who} onChange={(e) => setWho(e.target.value)} />
                            <button onClick={loadWheel} disabled={!who.trim()}>
                                Generate wheel
                            </button>
                        </div>

                        {myAssignedGift && (
                            <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "#f3f4f6" }}>
                                <b>You already got:</b> {myAssignedGift.title}
                            </div>
                        )}

                        {status && <div style={{ marginTop: 12 }}>{status}</div>}

                        {localResult && (
                            <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px dashed #bbb" }}>
                                <b>Wheel result:</b> {localResult.label}
                            </div>
                        )}

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
                </div>

                <Wheel segments={segments} disabled={!participant || !segments.length} onStop={commitSpin} />

                <footer style={{ opacity: 0.65, fontSize: 12, padding: "0 2px" }}>
                    Tip: for privacy, let people play one-by-one on the same device.
                </footer>
            </div>
        </main>
    );
}
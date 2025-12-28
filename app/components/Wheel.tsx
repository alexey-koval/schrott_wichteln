"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Segment = { id: string; label: string };

export function Wheel({
                          segments,
                          disabled,
                          onStop
                      }: {
    segments: Segment[];
    disabled?: boolean;
    onStop: (seg: Segment) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [angle, setAngle] = useState(0);
    const [spinning, setSpinning] = useState(false);

    const radius = 170;

    const safeSegments = useMemo(
        () => (segments.length ? segments : [{ id: "none", label: "No gifts available" }]),
        [segments]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;
            const n = safeSegments.length;
            const step = (Math.PI * 2) / n;

            for (let i = 0; i < n; i++) {
                const start = angle + i * step;
                const end = start + step;

                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, radius, start, end);
                ctx.closePath();

                ctx.fillStyle = i % 2 === 0 ? "#f3f4f6" : "#e5e7eb";
                ctx.fill();
                ctx.strokeStyle = "#d1d5db";
                ctx.stroke();

                const mid = (start + end) / 2;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(mid);
                ctx.textAlign = "right";
                ctx.fillStyle = "#111827";
                ctx.font = "12px system-ui";
                const label = safeSegments[i].label;
                ctx.fillText(label.length > 22 ? label.slice(0, 22) + "…" : label, radius - 10, 4);
                ctx.restore();
            }

            // Pointer (right side)
            ctx.beginPath();
            ctx.moveTo(cx + radius + 10, cy);
            ctx.lineTo(cx + radius + 35, cy - 12);
            ctx.lineTo(cx + radius + 35, cy + 12);
            ctx.closePath();
            ctx.fillStyle = "#111827";
            ctx.fill();
        };

        draw();
    }, [angle, safeSegments]);

    const spin = () => {
        if (disabled || spinning) return;
        if (!segments.length) return;

        setSpinning(true);

        // Fair selection:
        const winnerIndex = Math.floor(Math.random() * segments.length);
        const n = segments.length;
        const step = (Math.PI * 2) / n;

        // Pointer points right (0 rad). Make the segment center land there.
        const targetMid = winnerIndex * step + step / 2;

        const spins = 6 + Math.floor(Math.random() * 3);
        const targetAngle = -(spins * Math.PI * 2 + targetMid);

        const start = angle;
        const duration = 2600;
        const t0 = performance.now();

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const tick = (now: number) => {
            const t = Math.min(1, (now - t0) / duration);
            const eased = easeOutCubic(t);
            const a = start + (targetAngle - start) * eased;
            setAngle(a);

            if (t < 1) requestAnimationFrame(tick);
            else {
                setSpinning(false);
                onStop(segments[winnerIndex]);
            }
        };

        requestAnimationFrame(tick);
    };

    return (
        <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
            <h2 style={{ marginTop: 0 }}>Fortune wheel</h2>

            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <canvas ref={canvasRef} width={420} height={360} style={{ maxWidth: "100%", height: "auto" }} />
                <div style={{ display: "grid", gap: 10, minWidth: 220 }}>
                    <button onClick={spin} disabled={disabled || spinning || !segments.length}>
                        {spinning ? "Spinning…" : "Spin"}
                    </button>
                    <div style={{ opacity: 0.75, fontSize: 13 }}>
                        Segments: {segments.length}
                        <br />
                        Own gift + already assigned gifts are excluded.
                    </div>
                </div>
            </div>

            <style jsx>{`
        button {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #ddd;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
        </section>
    );
}
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function GiftForm({ initial }: { initial?: any }) {
    const [firstName, setFirstName] = useState(initial?.firstName || "");
    const [lastName, setLastName] = useState(initial?.lastName || "");
    const [nickname, setNickname] = useState(initial?.nickname || "");
    const [title, setTitle] = useState(initial?.gift?.title || "");
    const [wrapHint, setWrapHint] = useState(initial?.gift?.wrapHint || "");
    const [description, setDescription] = useState(initial?.gift?.description || "");

    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return (
        <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
            <h2 style={{ marginTop: 0 }}>My profile and gift</h2>

            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (loading) return;

                    setMessage(null);
                    setLoading(true);

                    try {
                        const res = await fetch("/api/gift", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                firstName,
                                lastName,
                                nickname,
                                title,
                                wrapHint,
                                description
                            })
                        });

                        const data = await res.json().catch(() => ({}));

                        if (!res.ok) {
                            setMessage(`Error: ${data?.error || "unknown"}`);
                            return;
                        }

                        setMessage("Saved ✅ Redirecting…");

                        // End participant session and go to Santa page
                        await signOut({ redirect: true, callbackUrl: "/santa" });
                    } catch (err: any) {
                        setMessage(`Error: ${err?.message || "network error"}`);
                    } finally {
                        setLoading(false);
                    }
                }}
                style={{ display: "grid", gap: 10 }}
            >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>

                <input
                    placeholder="Nickname (used above the wheel)"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <input
                    placeholder="Gift (short title)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    placeholder="Hint (wrap color / item / clue)"
                    value={wrapHint}
                    onChange={(e) => setWrapHint(e.target.value)}
                />
                <textarea
                    placeholder="Gift description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Saving…" : "Save"}
                </button>

                {message && <div style={{ opacity: 0.85 }}>{message}</div>}
            </form>

            <style jsx>{`
        input,
        textarea,
        button {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        textarea {
          resize: vertical;
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
    );
}
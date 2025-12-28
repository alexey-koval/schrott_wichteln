"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const router = useRouter();

    return (
        <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>Create account</h1>
            <p style={{ opacity: 0.75, marginBottom: 16 }}>
                Pick a username and password
            </p>

            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    setError(null);
                    setOk(null);

                    const res = await fetch("/api/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password })
                    });

                    const data = await res.json();
                    if (!res.ok) return setError(data?.error || "Registration failed");

                    setOk("Account created. Redirecting to login…");
                    setTimeout(() => router.push("/login"), 700);
                }}
                style={{ display: "grid", gap: 10 }}
            >
                <input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                />
                <input
                    placeholder="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Create</button>

                {error && <div style={{ color: "crimson" }}>{error}</div>}
                {ok && <div style={{ color: "green" }}>{ok}</div>}
            </form>

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
      `}</style>
        </main>
    );
}
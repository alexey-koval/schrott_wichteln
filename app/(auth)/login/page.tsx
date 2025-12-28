"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    return (
        <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>Secret Santa</h1>
            <p style={{ opacity: 0.75, marginBottom: 16 }}>Sign in with username and password</p>

            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    setError(null);

                    const res = await signIn("credentials", {
                        username,
                        password,
                        redirect: false
                    });

                    if (res?.error) return setError("Invalid username or password");
                    router.push("/");
                }}
                style={{ display: "grid", gap: 10 }}
            >
                <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Sign in</button>
                {error && <div style={{ color: "crimson" }}>{error}</div>}
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
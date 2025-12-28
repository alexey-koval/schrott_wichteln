"use client";

import { signOut } from "next-auth/react";

export function TopBar() {
    return (
        <header
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottom: "1px solid #eee"
            }}
        >
            <div style={{ fontWeight: 700 }}>🎁 Secret Santa</div>
            <button onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button>

            <style jsx>{`
        button {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #ddd;
          cursor: pointer;
        }
      `}</style>
        </header>
    );
}
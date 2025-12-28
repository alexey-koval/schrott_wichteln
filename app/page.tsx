"use client";

import { useEffect, useState } from "react";
import { GiftForm } from "./components/GiftForm";

export default function HomePage() {
    const [me, setMe] = useState<any>(null);

    useEffect(() => {
        fetch("/api/me")
            .then((r) => r.json())
            .then((d) => setMe(d.user))
            .catch(() => setMe(null));
    }, []);

    return (
        <main>
            <div
                style={{
                    maxWidth: 980,
                    margin: "0 auto",
                    padding: 16,
                    display: "grid",
                    gap: 16
                }}
            >
                <GiftForm initial={me} />

                <footer style={{ opacity: 0.65, fontSize: 12, padding: "0 2px" }}>
                    After saving, you will be signed out and redirected to Santa.
                </footer>
            </div>
        </main>
    );
}
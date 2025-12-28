"use client";

import { GiftForm } from "./components/GiftForm";

export default function HomePage() {
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
                <GiftForm />

                <footer style={{ opacity: 0.65, fontSize: 12, padding: "0 2px" }}>
                    After saving, please hand the device to Santa.
                </footer>
            </div>
        </main>
    );
}
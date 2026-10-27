"use client";
// filename: app/global-error.tsx

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0b0b0c",
          color: "#d7d4ce",
          fontFamily:
            "var(--font-plex-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <main
          style={{ maxWidth: "28rem", padding: "1.5rem", textAlign: "center" }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              color: "#a19e97",
            }}
          >
            A critical error occurred. Try reloading the application.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              cursor: "pointer",
              borderRadius: "0.375rem",
              border: "1px solid #26262a",
              background: "transparent",
              color: "#d7d4ce",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

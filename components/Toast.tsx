"use client";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

export default function Toast({ message, type = "success" }: ToastProps) {
  const colors = {
    success: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)", text: "#22c55e" },
    error: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", text: "#ef4444" },
    info: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)", text: "#3b82f6" },
  };
  const c = colors[type];
  const icons = { success: "✓", error: "✕", info: "ℹ" };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1.25rem",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        color: c.text,
        fontWeight: 600,
        fontSize: "0.875rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        maxWidth: 320,
      }}
    >
      <span style={{ fontWeight: 800 }}>{icons[type]}</span>
      {message}
    </div>
  );
}

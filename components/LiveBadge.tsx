"use client";

interface LiveBadgeProps {
  status: "live" | "completed";
  large?: boolean;
}

export default function LiveBadge({ status, large }: LiveBadgeProps) {
  const size = large ? { pad: "0.4rem 1rem", font: "0.8rem", dot: 9 } 
                     : { pad: "0.22rem 0.65rem", font: "0.68rem", dot: 7 };

  if (status === "completed") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: size.pad,
          background: "rgba(71,85,105,0.12)",
          border: "1px solid #1e293b",
          borderRadius: 999,
          fontSize: size.font,
          fontWeight: 700,
          color: "#475569",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        ✓ Completed
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: size.pad,
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.35)",
        borderRadius: 999,
        fontSize: size.font,
        fontWeight: 800,
        color: "#ef4444",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {/* Animated dot with ring */}
      <span
        style={{
          position: "relative",
          width: size.dot,
          height: size.dot,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          className="live-dot"
          style={{
            width: size.dot,
            height: size.dot,
            borderRadius: "50%",
            background: "#ef4444",
            display: "block",
            position: "relative",
            zIndex: 1,
          }}
        />
      </span>
      LIVE
    </span>
  );
}

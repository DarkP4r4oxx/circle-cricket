"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Live" },
  { href: "/standings", label: "Standings" },
  { href: "/matches", label: "Matches" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="anim-slide-down"
      style={{
        background: "rgba(7, 13, 26, 0.85)",
        borderBottom: "1px solid #1a2540",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 58,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontWeight: 900,
            fontSize: "1.1rem",
            textDecoration: "none",
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span style={{ fontSize: "1.25rem" }}>🏏</span>
          <span className="gradient-text">Circle Cricket</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "0.2rem" }}>
          {links.map((link, i) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`delay-${i + 1} anim-fade-in`}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: active ? "#22c55e" : "#64748b",
                  background: active ? "rgba(34, 197, 94, 0.1)" : "transparent",
                  border: active ? "1px solid rgba(34,197,94,0.2)" : "1px solid transparent",
                  transition: "all 0.18s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#64748b";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

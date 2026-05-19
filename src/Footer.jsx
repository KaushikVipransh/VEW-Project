import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        width: "100%",
        background: "#000000",
        color: "#ffffff",
        fontFamily: "'Geist Variable', sans-serif",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* ── Main Footer Body ── */}
      <div
        style={{
          padding: "56px 6vw 48px",
        }}
      >
        {/* Company Name */}
        <h2
          style={{
            fontWeight: 900,
            fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 10,
            color: "#ffffff",
          }}
        >
          Vardhman Engineering Works
        </h2>

        {/* Tagline */}
        <p
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 52,
            letterSpacing: "0.01em",
          }}
        >
          Precision Injection Molding&nbsp;&nbsp;|&nbsp;&nbsp;Delhi, India&nbsp;&nbsp;|&nbsp;&nbsp;Established 1999
        </p>

        {/* Three Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px 24px",
          }}
        >
          {/* ── ADDRESS ── */}
          <div>
            <h3
              style={{
                fontWeight: 800,
                fontSize: "0.92rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 20,
                color: "#ffffff",
              }}
            >
              Address
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "D-123, Bawana Industrial Area",
                "Sector 2",
                "New Delhi - 110039",
                "Delhi, India",
              ].map((line) => (
                <li
                  key={line}
                  style={{
                    fontSize: "0.88rem",
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {line}
                </li>
              ))}
              <li style={{ marginTop: 4 }}>
                <a
                  href="https://maps.google.com/?q=Bawana+Industrial+Area+Delhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.88rem",
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                    paddingBottom: 1,
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  }}
                >
                  Location Map
                </a>
              </li>
            </ul>
          </div>

          {/* ── CONTACT ── */}
          <div>
            <h3
              style={{
                fontWeight: 800,
                fontSize: "0.92rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 20,
                color: "#ffffff",
              }}
            >
              Contact
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "+91 9876543210", href: "tel:+919876543210" },
                { label: "+91 11 27654321", href: "tel:+911127654321" },
                { label: "sales@vardhmaneng.com", href: "mailto:sales@vardhmaneng.com" },
                { label: "info@vardhmaneng.com",  href: "mailto:info@vardhmaneng.com"  },
              ].map(({ label, href }) => (
                <li key={label} style={{ marginBottom: 8 }}>
                  <a
                    href={href}
                    style={{
                      fontSize: "0.88rem",
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                      display: "block",
                      lineHeight: 1.5,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── OFFICE HOURS ── */}
          <div>
            <h3
              style={{
                fontWeight: 800,
                fontSize: "0.92rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 20,
                color: "#ffffff",
              }}
            >
              Office Hours
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Monday - Saturday",
                "9:00 AM - 6:00 PM (IST)",
                "Closed Sundays",
                "Public Holidays",
              ].map((line) => (
                <li
                  key={line}
                  style={{
                    fontSize: "0.88rem",
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "18px 6vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.28)",
            textTransform: "uppercase",
          }}
        >
          © 2026 Vardhman Engineering Works
        </span>

        {/* Diamond star + tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
            }}
          >
            Designed for Precision
          </span>
         
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
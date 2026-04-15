import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const btnsRef = useRef(null);
  const statsRef = useRef(null);
  const cardsRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Nav entrance
      gsap.from(navRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Hero stagger
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(badgeRef.current, { y: 30, opacity: 0, duration: 0.6 })
        .from(headingRef.current, { y: 50, opacity: 0, duration: 0.8 }, "-=0.3")
        .from(subRef.current, { y: 30, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(btnsRef.current.children, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.15,
        }, "-=0.3");

      // Stats count-up feel
      gsap.from(".stat", {
        scrollTrigger: { trigger: ".stats-section", start: "top 80%" },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });

      // Feature cards scroll reveal
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: ".cards-grid", start: "top 75%" },
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
      });

      // Role pills
      gsap.from(".role-pill", {
        scrollTrigger: { trigger: ".roles-section", start: "top 80%" },
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "back.out(1.7)",
      });

      // CTA section
      gsap.from(".cta-section", {
        scrollTrigger: { trigger: ".cta-section", start: "top 80%" },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      // Floating glow pulse
      gsap.to(".hero-glow", {
        scale: 1.15,
        opacity: 0.6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Nav link hover magnetic feel
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("mouseenter", () => {
          gsap.to(link, { y: -2, duration: 0.2, ease: "power2.out" });
        });
        link.addEventListener("mouseleave", () => {
          gsap.to(link, { y: 0, duration: 0.3, ease: "elastic.out(1, 0.5)" });
        });
      });

      // Card hover lift
      document.querySelectorAll(".feature-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, { y: -6, duration: 0.3, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { y: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const colors = {
    bg: isDark ? "#08060d" : "#f4f3ec",
    surface: isDark ? "#0e0a18" : "#ffffff",
    border: isDark ? "#2a203a" : "#e0ddd8",
    cardBg: isDark ? "#0e0a18" : "#ffffff",
    cardBorder: isDark ? "#2a203a" : "#e8e5e0",
    text: isDark ? "#ffffff" : "#08060d",
    muted: isDark ? "#666" : "#888",
    pillBg: isDark ? "#1a1426" : "#f0eef8",
    pillBorder: isDark ? "#3a2a50" : "#d8d2f0",
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text, minHeight: "100vh", fontFamily: "var(--font-sans, sans-serif)", overflowX: "hidden" }}>

      {/* Navbar */}
      <nav ref={navRef} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.2rem 2.5rem", borderBottom: `0.5px solid ${colors.border}`,
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: isDark ? "rgba(8,6,13,0.85)" : "rgba(244,243,236,0.85)",
        backdropFilter: "blur(12px)",
      }}>
        <span style={{ fontSize: "15px", fontWeight: 500, color: "#aa3bff", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          SIWES Cloud
        </span>

        <div style={{ display: "flex", gap: "2rem" }}>
          {["Features", "Roles", "About"].map((item) => (
            <a key={item} className="nav-link" href={`#${item.toLowerCase()}`} style={{
              fontSize: "14px", color: colors.muted, textDecoration: "none", transition: "color 0.2s", display: "inline-block",
            }}
              onMouseEnter={e => e.target.style.color = colors.text}
              onMouseLeave={e => e.target.style.color = colors.muted}
            >{item}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button onClick={toggleTheme} style={{
            background: "transparent", border: `0.5px solid ${colors.border}`,
            color: colors.text, padding: "0.45rem 1rem", borderRadius: "10px", fontSize: "13px", cursor: "pointer",
          }}>
            {isDark ? "Light" : "Dark"}
          </button>
          <Link to="/register" style={{
            background: "#aa3bff", color: "#fff", padding: "0.5rem 1.2rem",
            borderRadius: "10px", fontSize: "14px", fontWeight: 500, textDecoration: "none",
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{
        minHeight: "88vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "5rem 2rem 3rem", position: "relative", overflow: "hidden",
      }}>
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(${isDark ? "#2a203a22" : "#aa3bff0a"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "#2a203a22" : "#aa3bff0a"} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

        {/* Glow */}
        <div className="hero-glow" style={{
          position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
          width: "700px", height: "350px", zIndex: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse, #aa3bff15 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "820px" }}>
          <div ref={badgeRef} style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            backgroundColor: isDark ? "#1a1426" : "#f0eef8",
            border: `0.5px solid ${isDark ? "#3a2a50" : "#d8d2f0"}`,
            color: "#aa3bff", fontSize: "12px", fontWeight: 500,
            letterSpacing: "0.15em", textTransform: "uppercase",
            padding: "0.4rem 1.1rem", borderRadius: "100px", marginBottom: "2rem",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#aa3bff", display: "inline-block" }} />
            SIWES Monitoring System
          </div>

          <h1 ref={headingRef} style={{
            fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 500,
            lineHeight: 1.08, marginBottom: "1.5rem",
          }}>
            Your Industrial Training,{" "}
            <em style={{ color: "#aa3bff", fontStyle: "normal" }}>Fully Digital.</em>
          </h1>

          <p ref={subRef} style={{
            fontSize: "1.1rem", color: colors.muted,
            maxWidth: "520px", lineHeight: 1.7, margin: "0 auto 2.5rem",
          }}>
            Track daily logs, get supervisor approvals, generate reports — all in one cloud platform built for Nigerian universities.
          </p>

          <div ref={btnsRef} style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{
              background: "#aa3bff", color: "#fff", padding: "0.8rem 2.2rem",
              borderRadius: "12px", fontSize: "15px", fontWeight: 500, textDecoration: "none",
            }}>
              Get Started Free
            </Link>
            <Link to="/login" style={{
              background: "transparent", color: colors.text,
              padding: "0.8rem 2.2rem", borderRadius: "12px", fontSize: "15px",
              border: `0.5px solid ${colors.border}`, textDecoration: "none",
            }}>
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-section" style={{ display: "flex", gap: "3rem", justifyContent: "center", flexWrap: "wrap", padding: "2rem 2rem 4rem" }}>
        {[
          { num: "4", label: "User roles" },
          { num: "20+", label: "Features" },
          { num: "100%", label: "Cloud-based" },
          { num: "∞", label: "Log entries" },
        ].map((s) => (
          <div key={s.label} className="stat" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 500, color: "#aa3bff" }}>{s.num}</div>
            <div style={{ fontSize: "13px", color: colors.muted, marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section id="features" style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <p style={{ textAlign: "center", fontSize: "12px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#aa3bff", marginBottom: "1rem" }}>
          What's included
        </p>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 500, marginBottom: "3rem" }}>
          Everything SIWES needs
        </h2>

        <div className="cards-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1px", background: colors.border, borderRadius: "20px", overflow: "hidden",
          border: `0.5px solid ${colors.border}`,
        }}>
          {[
            { title: "Daily Log Entries", desc: "Students log activities, tools used, skills learned, and challenges each day with attachment support.", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" },
            { title: "Supervisor Approval", desc: "Digital sign-off workflow for weekly entries with comments, feedback, and full approval history.", icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
            { title: "Coordinator Dashboard", desc: "School coordinators monitor all students, flag suspicious submissions, and track SIWES progress.", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
            { title: "GPS Check-in", desc: "Attendance with timestamp and location capture. Geofencing prevents fake check-ins from off-site.", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100 4 2 2 0 000-4" },
            { title: "Analytics & Reports", desc: "Export full PDF logbooks, attendance reports, and performance charts per student or department.", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
            { title: "Anti-Cheat System", desc: "Backdating prevention, IP logging, device tracking, and duplicate entry detection all built in.", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
          ].map((card) => (
            <div key={card.title} className="feature-card" style={{
              background: colors.cardBg, padding: "2rem", cursor: "default",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: isDark ? "#1a1426" : "#f0eef8",
                border: `0.5px solid ${colors.border}`,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem",
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#aa3bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, marginBottom: "0.5rem" }}>{card.title}</h3>
              <p style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="roles-section" style={{ padding: "4rem 2rem", maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 500, marginBottom: "2.5rem" }}>
          Built for every user
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
          {[
            { role: "Student", desc: "Log daily activities" },
            { role: "Supervisor", desc: "Review & approve entries" },
            { role: "Coordinator", desc: "Monitor all students" },
            { role: "Admin", desc: "Manage system & sessions" },
          ].map((r) => (
            <div key={r.role} className="role-pill" style={{
              background: colors.pillBg, border: `0.5px solid ${colors.pillBorder}`,
              borderRadius: "100px", padding: "0.6rem 1.4rem", fontSize: "14px", color: colors.muted,
            }}>
              <strong style={{ color: "#aa3bff" }}>{r.role}</strong> — {r.desc}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, marginBottom: "1rem" }}>
          Ready to go digital?
        </h2>
        <p style={{ color: colors.muted, marginBottom: "2rem" }}>
          Join thousands of students tracking their SIWES the modern way.
        </p>
        <Link to="/register" style={{
          background: "#aa3bff", color: "#fff", padding: "0.9rem 2.8rem",
          borderRadius: "12px", fontSize: "16px", fontWeight: 500, textDecoration: "none",
        }}>
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `0.5px solid ${colors.border}`, padding: "2rem",
        textAlign: "center", fontSize: "13px", color: colors.muted,
      }}>
        © 2026 SIWES Cloud — Cloud-Based SIWES Monitoring System
      </footer>
    </div>
  );
}

export default HomePage;
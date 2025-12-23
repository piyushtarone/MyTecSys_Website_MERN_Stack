// dashboard.js
"use client";

import { useEffect, useState, useRef } from "react";

export default function Dashboard() {
  const [name, setName] = useState("");
  const mvRef = useRef(null);
  const heroRef = useRef(null);
  const companyName = "YourCompanyName";
  const techRef = useRef(null);        // section wrapper
  const techModelRef = useRef(null);   // model-viewer in the tech section
  // CAROUSEL state
const services = [
  { title: "Project Outsourcing", text: "In this service, we offer you access to a dedicated development team of experienced professionals who can help you take your project from ideation to completion while ensuring project cost." },
  { title: "Business Development", text: "Our business development services are designed to help business grow & succeed.We work with our clients to develop customized strategies and implement them for maximum impact." },
  { title: "Branding & Marketing", text: "With our team of skilled professionals we deliver solutions that exceed expectations and drive success. Explore our comprehensive range of services designed to empower your business.." },
  { title: "Graphic Designing", text: "We at mytecsys consider the need of every investor and help them to achieve their goals with our quality graphics and content." },
  { title: "PRODUCT DESIGNING", text: "Whether you need a new product designed from scratch or an existing product updated, we have the expertise to deliver the results you need." },
  { title: "SOFTWARE DEVELOPMENT", text: "Our software development services are designed to help businesses leverage technology for growth and success by developing robust, scalable, and user-friendly software solutions." },
];

const [carouselIndex, setCarouselIndex] = useState(0);

// move to next (wrap)
const nextCard = () => setCarouselIndex((p) => (p + 1) % services.length);
// move to previous (wrap)
const prevCard = () => setCarouselIndex((p) => (p - 1 + services.length) % services.length);

// RIBBON: lines + state
const ribbonLines = [
  "software companies",
  "Better user Experience",
  "Database Architecture",
  "Agile Methodology",
];

const [ribbonIndex, setRibbonIndex] = useState(0);
const [ribbonVisible, setRibbonVisible] = useState(true);
const ribbonTimerRef = useRef(null);
const ribbonFadeTimeoutRef = useRef(null);

useEffect(() => {
  function onKey(e) {
    if (e.key === "ArrowRight") nextCard();
    if (e.key === "ArrowLeft") prevCard();
  }
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []); // no deps so only mounted once

// Ribbon Style
useEffect(() => {
  if (typeof window === "undefined") return;
  if (document.getElementById("ribbon-fade-styles")) return;

  const style = document.createElement("style");
  style.id = "ribbon-fade-styles";
  style.innerHTML = `
    .ribbon-text {
      transition: opacity 0.45s ease;
      opacity: 1;
      display: inline-block;
      white-space: nowrap;
    }
    .ribbon-text.hidden {
      opacity: 0;
    }
    @media (prefers-reduced-motion: reduce) {
      .ribbon-text { transition: none !important; }
    }
  `;
  document.head.appendChild(style);
}, []);

// Ribbon Logic
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (!storedName) {
      window.location.href = "/login";
    } else {
      setName(storedName);
    }
  }, []);

useEffect(() => {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // If user prefers reduced motion, just show the first line
  if (prefersReduced) {
    setRibbonIndex(0);
    setRibbonVisible(true);
    return;
  }

  const SWITCH_INTERVAL_MS = 2000;
  const FADE_OUT_MS = 500;
  const FADE_IN_DELAY_MS = FADE_OUT_MS + 50;

  // clear any existing timers (safety)
  if (ribbonTimerRef.current) clearInterval(ribbonTimerRef.current);
  if (ribbonFadeTimeoutRef.current) clearTimeout(ribbonFadeTimeoutRef.current);

  ribbonTimerRef.current = setInterval(() => {
    // start fade out
    setRibbonVisible(false);

    // after fade-out, switch text then fade-in
    ribbonFadeTimeoutRef.current = setTimeout(() => {
      setRibbonIndex(prev => (prev + 1) % ribbonLines.length);
      setRibbonVisible(true);
    }, FADE_IN_DELAY_MS);
  }, SWITCH_INTERVAL_MS);

  return () => {
    if (ribbonTimerRef.current) clearInterval(ribbonTimerRef.current);
    if (ribbonFadeTimeoutRef.current) clearTimeout(ribbonFadeTimeoutRef.current);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // Load model-viewer script if not present
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
      script.async = true;
      script.onload = () => console.log("model-viewer script loaded");
      script.onerror = (e) => console.error("Failed to load model-viewer script", e);
      document.head.appendChild(script);
    } else {
      console.log("model-viewer already registered");
    }
  }, []);

  // Scroll Animation
useEffect(() => {
  if (typeof window === "undefined") return;
  const MODEL_PATH = "/models/base_basic_shaded.glb"; // change if you want another glb
  const section = techRef.current;
  const modelEl = techModelRef.current;

  if (!section || !modelEl) return;

  // Lazy-load the model when section is near viewport top
  const io = new IntersectionObserver(async (entries, obs) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        // ensure model-viewer element defined
        if (!customElements.get("model-viewer")) {
          await customElements.whenDefined("model-viewer");
        }
        // set src only once
        if (!modelEl.getAttribute("src")) {
          modelEl.setAttribute("src", MODEL_PATH);
          // make non-interactive and no auto-rotate here
          modelEl.setAttribute("interaction-prompt", "none");
          modelEl.style.pointerEvents = "none";
        }
        // once loaded into view, we don't need observer
        obs.disconnect();
        break;
      }
    }
  }, { root: null, rootMargin: "300px 0px", threshold: 0.1 });

  io.observe(section);

  // Scroll handler: moves model from -150px (above) to 0px (final)
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // when top is at bottom of viewport -> progress 0
      // when top reaches 20% from top -> progress 1
      const start = vh; // start when section top is at viewport bottom
      const end = vh * 0.2; // end when section top reaches 20% from top
      const raw = (start - rect.top) / (start - end);
      const progress = Math.max(0, Math.min(1, raw));
      // translateY from -150px -> 0
      const startY = -150;
      const translateY = startY + progress * Math.abs(startY);
      if (modelEl && modelEl.style) {
        modelEl.style.transform = `translateY(${translateY}px)`;
      }
      ticking = false;
    });
  }

  // initialize position (off-screen above)
  if (modelEl && modelEl.style) {
    modelEl.style.transform = `translateY(-150px)`;
    modelEl.style.transition = "transform 0.05s linear"; // we update in RAF so tiny transition
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // run once to set correct position
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    io.disconnect();
  };
}, []);


  // Insert sway keyframes + hover behavior CSS into page (only once)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // don't insert duplicate <style>
    if (document.getElementById("mv-sway-styles")) return;

    const style = document.createElement("style");
    style.id = "mv-sway-styles";

    // tweak amplitude (px) and duration (s) here if you want
    const amplitudePx = 10; // how many px left-right (small value for subtlety)
    const durationSec = 2; // seconds for full back-and-forth cycle
    
    style.innerHTML = `
      @keyframes mv-sway {
        0%   { transform: translateX(-${amplitudePx}px) translateZ(0); }
        50%  { transform: translateX(${amplitudePx}px) translateZ(0); }
        100% { transform: translateX(-${amplitudePx}px) translateZ(0); }
      }

      /* apply to the model-viewer element container */
      .mv-sway {
        will-change: transform;
        animation-name: mv-sway;
        animation-duration: ${durationSec}s;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        /* keep the element composited on its own layer for smoothness */
        transform: translateZ(0);
      }

      /* pause sway when hovered/focused so user can inspect */
      .mv-sway:hover,
      .mv-sway:focus {
        animation-play-state: paused;
      }

      /* Respect prefers-reduced-motion: disable animation entirely */
      @media (prefers-reduced-motion: reduce) {
        .mv-sway { animation: none !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Lazy-load GLB when hero enters viewport, then add sway class
  useEffect(() => {
    const MODEL_PATH = "/models/base_basic_shaded.glb"; // ensure file in public/models/
    const mvEl = mvRef.current;
    const heroEl = heroRef.current;

    if (!mvEl || !heroEl) return;

    // No auto-rotate: we want only left-right sway, not rotation.
    // IntersectionObserver to lazy-load
    const io = new IntersectionObserver(
      async (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            try {
              if (!customElements.get("model-viewer")) {
                await customElements.whenDefined("model-viewer");
              }

              // set the model source (forward slashes)
              mvEl.setAttribute("src", MODEL_PATH);
              console.log("Model src set:", MODEL_PATH);

              // camera initial view (optional)
              mvEl.setAttribute("camera-orbit", "20deg 80deg 3.6m");
              // disable auto-rotate (do NOT set auto-rotate)


              // add sway CSS class if user does NOT prefer reduced motion
              const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              if (!prefersReduced) {
                // add the class that runs the CSS keyframe sway
                mvEl.classList.add("mv-sway");
              } else {
                mvEl.classList.remove("mv-sway");
              }

            } catch (err) {
              console.error("Error while loading model:", err);
            } finally {
              obs.disconnect();
            }
            break;
          }
        }
      },
      { root: null, rootMargin: "100px 10px", threshold: 0.5 }
    );

    io.observe(heroEl);
    return () => io.disconnect();
  }, []);

  return (
    <div style={styles.page} position="static" >
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <img src="/models/logo.png" id="logo" alt="Company Logo" style={styles.logoImage} onError={e=> e.currentTarget.style.display='none'} />
          <span style={styles.logoText}></span>
        </div>

        <nav style={styles.navbar}>
          <a href="#services" style={styles.navLink}>Services</a>
          <a href="#portfolio" style={styles.navLink}>Portfolio</a>
          <a href="#products" style={styles.navLink}>Products</a>
          <a href="#careers" style={styles.navLink}>Careers</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
        </nav>
      </header>

      <main style={styles.main}>
        <section style={styles.heroSection} ref={heroRef} aria-label="hero">
          <div style={styles.left3d}>
            {/* model-viewer element */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <model-viewer
              ref={mvRef}
              id="mv"
              style={styles.modelViewer}
              alt="3D developer illustration with floating code panels"
              // camera-controls
              interaction-prompt="none"
              ar
            />
          </div>

          <div style={styles.rightContent}>
            <h2 style={styles.heroTitle}>
              CUSTOMIZED SOFTWARE DEVELOPMENT COMPANY
              <br />
              FOR YOUR BUSINESS
            </h2>

            <p style={styles.heroParagraph}>
              Transform your ideas into reality with our innovative technology solutions.
            </p>

            <div style={{ marginTop: 60 }}>
              <a href="/contact" style={styles.contactButton}>Contact Us</a>
            </div>

            <p style={styles.welcomeText}>
              Welcome <strong style={{ color: "#2563eb" }}>{name}</strong> into <strong>{companyName}</strong>
            </p>
          </div>
        </section>
        {/* RIBBON - placed directly below hero */}
<div style={styles.ribbonWrap} aria-hidden={false}>
  <div style={styles.ribbonInner}>
    <div style={styles.ribbonTextWrap}>
      <span
        role="status"
        aria-live="polite"
        className={`ribbon-text ${ribbonVisible ? "" : "hidden"}`}
        key={ribbonIndex} // forces remount for consistent transitions on some browsers
        style={styles.ribbonText}
      >
        {ribbonLines[ribbonIndex]}
      </span>
    </div>
  </div>
</div>

{/* INNOVATIVE TECHNOLOGIES SECTION */}
<section ref={techRef} style={styles.techSection} aria-label="innovative-technologies">
    
  <div style={styles.techLeft}>
    
  
    <div style={styles.techTable}>
      {[
        "Web Development",
        "Android Development",
        "Internet Of Things",
        "Software Development",
        "Machine Learning",
      ].map((item, idx) => (
        <div key={idx} style={styles.techRow}>
          <img
            src={`models/icons/tech-${idx + 1}.png`} 
            alt=""
            style={styles.techIcon}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span style={styles.techText}>{item}</span>
        </div>
      ))}
    </div>
  </div>

  <div style={styles.techRight}>
    {/* second model-viewer: model moves down on scroll via effect above */}
    {/* eslint-disable-next-line react/no-unknown-property */}
    <model-viewer
      ref={techModelRef}
      style={styles.techModelViewer}
      alt="3D developer model for innovative technologies"
      interaction-prompt="none"
      ar
    />
  </div>
</section>


{/* SERVICES CAROUSEL */}
<section aria-label="services-carousel" style={styles.carouselSection}>
  <h2 style={styles.carouselServices}>Services</h2>
  <h3 style={styles.carouselHeading}>We are 100% dedicated</h3>

  <div style={styles.carouselWrap}>
    {/* Left arrow */}
    <button
      aria-label="Previous"
      onClick={prevCard}
      style={styles.arrowButton}
    >
      ‹
    </button>

    <div style={styles.carouselViewport}>
      <div
        style={{
          ...styles.carouselTrack,
          // translateX moves the track so the active index is centered
          transform: `translateX(calc(${ -carouselIndex * 100 }%))`,
        }}
      >
        {services.map((s, i) => {
          // position relative to current index
          const offset = i - carouselIndex;
          // For wrap-around visual: calculate shortest offset
          const half = Math.floor(services.length / 2);
          let wrappedOffset = offset;
          if (offset > half) wrappedOffset = offset - services.length;
          if (offset < -half) wrappedOffset = offset + services.length;

          const visible = Math.abs(wrappedOffset) <= 1; // center or adjacent
          const isCenter = wrappedOffset === 0;

          return (
            <div
              key={i}
              style={{
                ...styles.card,
                // visible neighbors slightly scaled and faded
                opacity: visible ? (isCenter ? 1 : 0.45) : 0,
                transform: isCenter ? "scale(1)" : "scale(0.98)",
                pointerEvents: isCenter ? "auto" : "none",
              }}
              aria-hidden={!isCenter}
            >
              <div style={styles.cardInner}>
                <div style={styles.cardIconWrapper}>
                  <img src={`models/icons/service/tech-${i+1}.png`} alt="" style={styles.cardIcon} onError={e=>e.currentTarget.style.display='none'} />
                </div>
                <h4 style={styles.cardTitle}>{s.title}</h4>
                <p style={styles.cardText}>{s.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Right arrow */}
    <button
      aria-label="Next"
      onClick={nextCard}
      style={{ ...styles.arrowButton, right: 12 }}
    >
      ›
    </button>
  </div>
</section>


{/* ---------- FOOTER ---------- */}
<footer style={styles.footer}>
  <div style={styles.footerInner}>
    {/* Left: Logo + Contact */}
    <div style={styles.footerCol}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="models/logo.png" alt="Company logo" style={styles.footerLogo} onError={e=>e.currentTarget.style.display='none'} />
        <div>
          {/* <div style={{ fontWeight: 700 }}>My Tec Sys</div> */}
          {/* <div style={{ fontSize: 12, color: "#0f172a66" }}>We bring your imagination into the Real World</div> */}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={styles.footerLabel}>Contact Details</div>
        <div style={styles.footerText}><strong>Address:</strong> Nagpur, Maharashtra, India</div>
        <div style={styles.footerText}><strong>Phone:</strong> <a href="tel:+919405741343" style={styles.link}>+91 9405741343</a></div>
        <div style={styles.footerText}><strong>Email:</strong> <a href="mailto:info@mytecsys.in" style={styles.link}>info@mytecsys.in</a></div>
      </div>
    </div>

    {/* Middle columns */}
    <div style={styles.footerCols}>
      <div style={styles.footerColList}>
        <div style={styles.footerLabel}>Useful Links</div>
        <a href="#services" style={styles.footerLinkItem}>Services</a>
        <a href="#portfolio" style={styles.footerLinkItem}>Portfolio</a>
        <a href="#technologies" style={styles.footerLinkItem}>Technologies</a>
        <a href="#career" style={styles.footerLinkItem}>Career</a>
        <a href="#gallery" style={styles.footerLinkItem}>Gallery</a>
        <a href="#contact" style={styles.footerLinkItem}>Contact</a>
      </div>

      <div style={styles.footerColList}>
        <div style={styles.footerLabel}>Our Services</div>
        <a href="#business" style={styles.footerLinkItem}>Business Development</a>
        <a href="#branding" style={styles.footerLinkItem}>Branding & Marketing</a>
        <a href="#software" style={styles.footerLinkItem}>Software Development</a>
        <a href="#product" style={styles.footerLinkItem}>Product Designing</a>
        <a href="#graphic" style={styles.footerLinkItem}>Graphic Designing</a>
        <a href="#outsourcing" style={styles.footerLinkItem}>Project Outsourcing</a>
      </div>

      <div style={styles.footerColList}>
        <div style={styles.footerLabel}>Other Links</div>
        <a href="#collab" style={styles.footerLinkItem}>Collaboration</a>
        <a href="#terms" style={styles.footerLinkItem}>Terms of service</a>
        <a href="#privacy" style={styles.footerLinkItem}>Privacy policy</a>
      </div>
    </div>

    {/* Right: Social + App badges */}
    <div style={styles.footerColRight}>
      <div style={styles.footerLabel}>Our Social Networks</div>
      <div style={styles.socialRow}>
        {/* Use your own social icon SVG/PNG in /icons/ */}
        <a href="#" aria-label="Facebook" style={styles.socialIcon}><img src="models/icons/social/facebook.png" alt="" style={styles.socialImg} /></a>
        <a href="#" aria-label="Instagram" style={styles.socialIcon}><img src="models/icons/social/instagram.png" alt="" style={styles.socialImg} /></a>
        <a href="#" aria-label="Twitter" style={styles.socialIcon}><img src="models/icons/social/twitter.png" alt="" style={styles.socialImg} /></a>
        <a href="#" aria-label="LinkedIn" style={styles.socialIcon}><img src="models/icons/social/linkedin.png" alt="" style={styles.socialImg} /></a>
        <a href="#" aria-label="YouTube" style={styles.socialIcon}><img src="models/icons/social/youtube.png" alt="" style={styles.socialImg} /></a>
        <a href="#" aria-label="WhatsApp" style={styles.socialIcon}><img src="models/icons/social/whatsapp.png" alt="" style={styles.socialImg} /></a>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <img src="models/icons/social/googleplay.png" alt="Google Play" style={styles.appBadge} onError={e=>e.currentTarget.style.display='none'} />
        <img src="models/icons/social/appstore.png" alt="App Store" style={styles.appBadge} onError={e=>e.currentTarget.style.display='none'} />
        <img src="models/icons/social/cromestore.png" alt="Chrome Store" style={styles.appBadge} onError={e=>e.currentTarget.style.display='none'} />
      </div>
    </div>
  </div>

  <div style={styles.footerBottom}>
    © {new Date().getFullYear()} Mytecsys.in. All rights reserved.
  </div>
</footer>


      </main>
    </div>
  );
}

/* styles (unchanged) */
const styles = {
  page: { fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial", color: "#111827", minHeight: "100vh", background: "#798d9fff" },
  header: { width: "100%", padding: "22px 40px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", boxSizing: "border-box" },
  logoWrap: { position: "absolute", left: "80px", display: "flex", alignItems: "center", gap: 10,  },
  logoImage: { height: 80, width: "auto" },
  logoText: { fontWeight: 800, fontSize: 28 },
  navbar: { display: "flex",position:"relative", gap: 38, padding: "12px 32px", borderRadius: 999, background: "#fff", boxShadow: "0 8px 24px rgba(16,24,40,0.06)", fontSize: 16, fontWeight: 500 },
  navLink: { color: "#111827", textDecoration: "none", padding: "6px 10px", borderRadius: 6, transition: "background .18s ease, color .18s ease" },
  main: { maxWidth: 1300, margin: "54px auto", padding: "0 20px" },
  heroSection: { display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between", background: "#fff", padding: 1, borderRadius: 12, boxShadow: "10 12px 100px rgba(16,24,40,0.06)", flexWrap: "wrap" },
  left3d: { flex: "1 1 420px", minWidth: 320, maxWidth: 480, height: 420, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(249,250,253,1) 100%)" },
  modelViewer: { width: "100%", height: "100%", minWidth: 240, minHeight: 240, borderRadius: 10 },
  rightContent: { flex: "0.1 1 560px", display: "flex", flexDirection: "column", alignItems: "flex-start" },
  heroTitle: { fontSize: 20, lineHeight: 1.25, margin: 0, fontWeight: 700, color: "#0f172a" },
  heroParagraph: { marginTop: 12, color: "#374151", fontSize: 16 },
  contactButton: { display: "inline-block", background: "#2563eb", color: "#fff", padding: "10px 18px", borderRadius: 8, textDecoration: "none", fontWeight: 600, transition: "transform .12s ease, box-shadow .12s ease" },
  welcomeText: { marginTop: 18, color: "#6b7280", fontSize: 14 },

  // add to styles { ... }
ribbonWrap: {
  marginTop: 0,
  display: "flex",
  justifyContent: "center",
  width: "100%",
  height:60,
  padding: "0 1px",
  boxSizing: "border-box",
},
ribbonInner: {
  width: "100%",
  maxWidth: 1300, // match your main maxWidth to avoid overflow
  background: "linear-gradient(90deg, #7a9fedff 0%, #1e40af 100%)",
  color: "#fff",
  borderRadius: 15,
  padding: "1px 2px",
  boxShadow: "0 8px 30px rgba(37,99,235,0.18)",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},
ribbonTextWrap: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 80,
},
ribbonText: {
  fontSize: 25,
  fontWeight: 600,
  textAlign: "center",
  whiteSpace: "nowrap",
  display: "inline-block",
  padding: "0 10px",
},

/* Innovative tech section styles */
techSection: {
  display: "flex",
  gap: 30,
  alignItems: "center",
  justifyContent: "space-between",
  maxWidth: 1300,
  margin: "0px auto",
  padding: "26px",
  background: "#ffffff",
  borderRadius: 12,
  border: "5px solid rgba(7, 11, 17, 0.05)",
  boxShadow: "10 102px 40px rgba(16,24,40,0.06)",
  boxSizing: "border-box",
  overflow: "hidden",
  flexWrap: "wrap",
},

techLeft: {
  flex: "0 1 420px",
  minWidth: 280,
  maxWidth: 520,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
},

techTable: {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 20,
},

techRow: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  borderRadius: 10,
  background: "#f8fafc",
  boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.02)",
},

techIcon: {
  height: 56,
  width: 56,
  objectFit: "contain",
  borderRadius: 6,
},

techText: {
  fontSize: 16,
  fontWeight: 600,
  color: "#0f172a",
},

techRight: {
  flex: "1 1 420px",
  minWidth: 300,
  maxWidth: 600,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  position: "relative",
  // ensure the model can move inside this container
  overflow: "visible",
  height: 420,
},

techModelViewer: {
  width: "110%",
  height: "110%",
  minWidth: 500,
  minHeight: 500,
  borderRadius: 10,
  // we will manipulate translateY in JS, so set transform-style
  transform: "translateY(-150px)",
  transition: "transform 0.08s linear",
  willChange: "transform",
  pointerEvents: "none",
},

/* Carousel / cards */
carouselSection: {
  maxWidth: 1200,
  margin: "0px auto",
  padding: "1px 0px",
  boxSizing: "border-box",
},

carouselHeading: {
  textAlign: "center",
  fontSize: 22,
  fontWeight: 800,
  marginBottom: 18,
  color: "#0f172a",
},

carouselServices: {
  textAlign: "center",
  fontSize: 22,
  fontWeight: 800,
  marginBottom: 18,
  color: "#1247c3ff",
},

carouselWrap: {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

carouselViewport: {
  overflow: "hidden",
  width: "100%",
  maxWidth: 980,
  borderRadius: 12,
},

carouselTrack: {
  display: "flex",
  transition: "transform 420ms cubic-bezier(.22,.9,.21,1)",
  // allow overscroll hidden
  willChange: "transform",
},

card: {
  minWidth: "100%", // each card fills the viewport width inside viewport
  boxSizing: "border-box",
  padding: 2,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "center",
},

cardInner: {
  width: "100%",
  maxWidth: 920,
  display: "flex",
  flexDirection: "column", // vertical flow: top-row then body
  gap: 12,
  background: "#f8fafc",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 8px 30px rgba(16,24,40,0.06)",
},

cardIconWrapper: {
  width: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
},

cardIcon: {
  width: 70,
  height: 76,
  objectFit: "contain",
  alignitems: "center",
},

cardTitle: {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  textalign: "center",
},

cardText: {
  marginTop: 8,
  fontSize: 14,
  color: "#374151",
  lineHeight: 1.5,
},

arrowButton: {
  width: 48,
  height: 40,
  borderRadius: 8,
  border: "none",
  background: "#fff",
  boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

footer: {
  marginTop: 40,
  background: "#e8f6fb", // light blue background like reference
  padding: "36px 20px 18px",
  color: "#0f172a",
  borderradius: 20,
},
footerInner: {
  maxWidth: 1200,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1fr 1fr 360px", // left, middle columns, right
  gap: 28,
  alignItems: "start",
},
footerCol: {
  display: "flex",
  flexDirection: "column",
  gap: 8,
},
footerLogo: { height: 72, width: "auto" },

footerLabel: { fontWeight: 700, marginBottom: 8, color: "#0f172a" },
footerText: { fontSize: 14, color: "#0f172a88", marginTop: 6 },

footerCols: {
  display: "flex",
  gap: 20,
  justifyContent: "space-between",
},
footerColList: {
  display: "flex",
  flexDirection: "column",
  gap: 8,
},
footerLinkItem: {
  fontSize: 14,
  color: "#0f172a",
  textDecoration: "none",
  padding: "4px 0",
},
link: { color: "#0f172a", textDecoration: "underline" },

footerColRight: {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 12,
},

socialRow: { display: "flex", gap: 12, alignItems: "center" },
socialIcon: {
  display: "inline-flex",
  background: "#fff",
  borderRadius: 8,
  padding: 8,
  boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
},
socialImg: { width: 20, height: 20, objectFit: "contain" },

appBadge: {
  height: 40,
  width: "auto",
  borderRadius: 6,
  boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
},

footerBottom: {
  maxWidth: 1200,
  margin: "18px auto 0",
  paddingTop: 12,
  borderTop: "1px solid rgba(15,23,42,0.04)",
  textAlign: "center",
  fontSize: 13,
  color: "#0f172a88",
},
/* responsive */
"@media (max-width:900px)": {
  footerInner: { gridTemplateColumns: "1fr", gap: 18 },
  footerColRight: { alignItems: "flex-start" },
  footerCols: { flexDirection: "column", gap: 12 },
},


};



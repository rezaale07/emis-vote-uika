import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* =========================
   HOOK: REVEAL ON SCROLL
========================= */
function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");

    const onScroll = () => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh - 120) el.classList.add("reveal-show");
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

function useNavbarShrink() {
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return shrink;
}


/* =========================
   MAIN COMPONENT
========================= */
export default function Welcome() {
  useRevealOnScroll();
  const shrink = useNavbarShrink();
  const featureRef = useRef(null);

  // ===== slider state =====
  const images = ["/img/iklan1.png", "/img/iklan2.png", "/img/iklan3.png"];
const [current, setCurrent] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, 3000);
  return () => clearInterval(interval);
}, []);

  // ========================

  const scrollToFeature = () => {
    featureRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden">

      {/* ================= HEADER ================= */}
      <header
        className={`sticky top-0 z-50 border-b transition-all ${
          shrink ? "bg-white/90 backdrop-blur shadow-sm" : "bg-white/70 backdrop-blur"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl">
  <img
    src="/img/logouika.png"
    alt="Logo UIKA"
    className="h-full w-full object-contain"
  />
</div>

            <div className="leading-tight">
              <p className="text-sm font-semibold">EMIS-Vote UIKA</p>
              <p className="text-xs text-slate-500 -mt-0.5">
                Event & Voting Kampus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToFeature}
              className="hidden sm:inline-flex btn-secondary"
            >
              Lihat Fitur ↓
            </button>

            <Link to="/login">
              <button className="btn-primary">
                Login →
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute top-20 -right-28 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT */}
            <div data-reveal className="reveal-base">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                Universitas Ibn Khaldun Bogor
              </span>

              <p className="mt-4 text-sm font-medium text-slate-600">
                Platform Event & Voting Kampus
              </p>

              <h1 className="mt-3 text-4xl md:text-[2.6rem] font-extrabold leading-tight">
                Event & Voting Digital
                <br />
                <span className="text-blue-600">
                  Modern • Aman • Transparan
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm text-slate-600">
                EMIS-Vote adalah sistem manajemen event dan voting digital
                berbasis web yang dirancang untuk meningkatkan efisiensi,
                transparansi, dan partisipasi kegiatan kampus.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/login">
                  <button className="btn-primary">
                    Mulai Sekarang →
                  </button>
                </Link>
                <button onClick={scrollToFeature} className="btn-secondary">
                  Pelajari Fitur ↓
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
                <Pill>UI Modern</Pill>
                <Pill>Akses Cepat</Pill>
                <Pill>Role-based</Pill>
                <Pill>Real-time</Pill>
              </div>
            </div>

            {/* RIGHT */}
            <div data-reveal className="reveal-base">
  <div className="overflow-hidden shadow-xl ring-1 ring-slate-200 bg-white">
    <div className="relative h-[340px] w-full bg-white overflow-hidden">
      {images.map((img, index) => (
        <img
          key={img}
          src={img}
          alt={`iklan ${index + 1}`}
          className={
            "absolute inset-0 h-full w-full object-contain transition-all duration-700 " +
            (index === current ? "opacity-100" : "opacity-0")
          }
        />
      ))}
    </div>
  </div>
</div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section ref={featureRef} className="py-20">
        <div className="mx-auto max-w-6xl px-4">

          <div data-reveal className="reveal-base text-center">
            <p className="text-xs font-semibold text-blue-600 tracking-wide">
              FITUR UNGGULAN
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold">
              Solusi Digital Kampus Terpadu
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Seluruh kebutuhan event dan voting kampus dalam satu platform.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="📅"
              title="Event Management"
              desc="Kelola event, poster, jadwal, dan peserta secara terstruktur."
            />
            <FeatureCard
              icon="🗳️"
              title="Voting Digital"
              desc="Sistem voting online yang aman dan transparan."
            />
            <FeatureCard
              icon="📊"
              title="Monitoring & Laporan"
              desc="Pantau partisipasi dan aktivitas event secara real-time."
            />
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <SmallCard
              title="Keamanan Terjamin"
              desc="Autentikasi dan validasi data berbasis role."
            />
            <SmallCard
              title="Cepat & Efisien"
              desc="UI ringan dan responsif di berbagai perangkat."
            />
            <SmallCard
              title="User Friendly"
              desc="Mudah digunakan oleh mahasiswa maupun admin."
            />
          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-blue-700 py-20 text-white">
        <div data-reveal className="reveal-base mx-auto max-w-6xl px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold">
            Siap Menggunakan EMIS-Vote?
          </h3>
          <p className="mt-3 text-sm text-white/90">
            Login dan mulai kelola event serta voting kampus dengan mudah.
          </p>

          <div className="mt-7 flex justify-center gap-3">
            <Link to="/login">
              <button className="btn-light">
                Login Sekarang →
              </button>
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="btn-outline"
            >
              Kembali ke Atas ↑
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white font-bold">
              E
            </div>
            EMIS-Vote UIKA
          </div>
          <div className="text-center md:text-right">
            © 2025 Universitas Ibn Khaldun Bogor
            <br />Powered by UIKA IT Division
          </div>
        </div>
      </footer>

      {/* ================= STYLES ================= */}
      <style>{`
        .btn-primary{
          background:#2563eb;
          color:white;
          padding:.75rem 1.5rem;
          border-radius:9999px;
          font-size:.875rem;
          font-weight:700;
          transition:.2s;
        }
        .btn-primary:hover{ background:#1d4ed8; transform:translateY(-1px); }

        .btn-secondary{
          background:white;
          border:1px solid #e2e8f0;
          padding:.75rem 1.5rem;
          border-radius:9999px;
          font-size:.875rem;
          font-weight:700;
        }
        .btn-secondary:hover{ background:#f1f5f9; }

        .btn-light{
          background:white;
          color:#1d4ed8;
          padding:.75rem 1.5rem;
          border-radius:9999px;
          font-weight:700;
        }

        .btn-outline{
          border:1px solid white;
          padding:.75rem 1.5rem;
          border-radius:9999px;
          font-weight:700;
        }

        .reveal-base{
          opacity:0;
          transform:translateY(30px);
          transition:.8s ease;
        }
        .reveal-show{
          opacity:1;
          transform:none;
        }
      `}</style>
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function Pill({ children }) {
  return (
    <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
      {children}
    </span>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div data-reveal className="reveal-base rounded-3xl bg-white border p-6 shadow-sm hover:-translate-y-2 hover:shadow-xl transition">
      <div className="text-2xl">{icon}</div>
      <h4 className="mt-4 text-sm font-extrabold">{title}</h4>
      <p className="mt-2 text-xs text-slate-600">{desc}</p>
    </div>
  );
}

function SmallCard({ title, desc }) {
  return (
    <div className="rounded-3xl bg-white border p-6 shadow-sm hover:shadow-md transition">
      <h4 className="text-sm font-extrabold">{title}</h4>
      <p className="mt-2 text-xs text-slate-600">{desc}</p>
    </div>
  );
}

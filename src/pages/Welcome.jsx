import { Link } from "react-router-dom";
import React from "react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Top bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white shadow-sm">
              <span className="text-sm font-bold">E</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">EMIS-Vote UIKA</span>
          </div>

          <Link to="/login" className="inline-block">
  <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:translate-y-[1px]">
    Login
    <span aria-hidden className="text-base leading-none">→</span>
  </button>
</Link>

        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
            {/* Left */}
            <div>
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Universitas Ibn Khaldun Bogor
              </div>

              <p className="mt-4 text-sm font-medium text-slate-700">Platform Event &amp; Voting Kampus</p>

              <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                Sistem manajemen event dan voting digital yang modern, aman, dan mudah digunakan
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
                Sistem manajemen event dan voting digital yang modern, aman, dan mudah digunakan untuk seluruh sivitas
                akademika UIKA.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                 <Link to="/login">
                <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:translate-y-[1px]">
                  Mulai Sekarang
                  <span aria-hidden className="text-base leading-none">
                    →
                  </span>
                </button>
                </Link>

                <button className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                  Pelajari Fitur
                </button>
              </div>
            </div>

            {/* Right */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-30px_rgba(2,6,23,0.35)] ring-1 ring-slate-100">
                {/* Replace src with your real image */}
                <img
                  src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop"
                  alt="Event kampus"
                  className="h-[260px] w-full object-cover md:h-[320px]"
                />
              </div>

              {/* Badges */}
              <div className="pointer-events-none absolute -right-2 -top-4 md:-right-4">
                <div className="w-[150px] rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-100">
                  <div className="flex items-start gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                      <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Events Aktif</p>
                      <p className="text-lg font-bold text-slate-900">25+</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -left-2 bottom-6 md:-left-4">
                <div className="w-[190px] rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-100">
                  <div className="flex items-start gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                      <span className="text-lg">✅</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Total Mahasiswa</p>
                      <p className="text-lg font-bold text-slate-900">5000+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-wide text-blue-600">Fitur Unggulan</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">
                Platform lengkap untuk mengelola event kampus dan sistem voting digital
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              <FeatureCard
                icon="📅"
                title="Event Management"
                desc="Kelola dan ikuti berbagai acara kampus dengan mudah"
              />
              <FeatureCard icon="🗳️" title="Sistem Voting" desc="Voting online yang aman dan transparan untuk berbagai pemilihan" />
              <FeatureCard icon="📈" title="Real-time Analytics" desc="Pantau hasil voting dan partisipasi event secara real-time" muted />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <SmallCard title="Keamanan Terjamin" desc="Data dan voting Anda dilindungi dengan sistem keamanan terpercaya" />
              <SmallCard title="Cepat & Efisien" desc="Interface yang cepat dan mudah digunakan untuk semua pengguna" />
              <SmallCard title="User-Friendly" desc="Dirancang khusus untuk kemudahan mahasiswa dan admin" />
            </div>
          </div>
        </section>

        {/* Why section (blue) */}
        <section className="bg-blue-700 py-16 text-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold md:text-2xl">Kenapa Memilih EMIS-Vote?</h3>
              <p className="mt-3 max-w-xl text-sm text-white/85">
                Platform yang dirancang khusus untuk meningkatkan partisipasi dan transparansi dalam kegiatan kampus
              </p>

              <ul className="mt-6 space-y-3 text-sm text-white/90">
                <CheckItem> Akses dari mana saja, kapan saja </CheckItem>
                <CheckItem> Notifikasi real-time untuk event &amp; voting </CheckItem>
                <CheckItem> Dashboard interaktif dan informatif </CheckItem>
                <CheckItem> Laporan dan statistik lengkap </CheckItem>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
              <div className="space-y-4">
                <StatRow icon="👥" value="5000+" label="Mahasiswa Aktif" />
                <StatRow icon="📅" value="100+" label="Events Terlaksana" />
                <StatRow icon="🧾" value="10000+" label="Votes Tercatat" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="text-xs font-semibold text-blue-600">Siap Untuk Memulai?</p>
            <p className="mt-2 text-sm text-slate-600">
              Bergabunglah dengan ribuan mahasiswa UIKA yang sudah menggunakan EMIS-Vote
            </p>

            <div className="mt-6">
                 <Link to="/login">
              <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:translate-y-[1px]">
                Login Sekarang
                <span aria-hidden className="text-base leading-none">
                  →
                </span>
              </button>
                </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
              <span className="text-xs font-bold">E</span>
            </div>
            <span>EMIS-Vote UIKA</span>
          </div>
          <div className="text-center md:text-right">
            <p>© 2025 Universitas Ibn Khaldun Bogor. All rights reserved.</p>
            <p className="mt-1">Powered by UIKA IT Division</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Small components ---------- */

function FeatureCard({ icon, title, desc, muted = false }) {
  return (
    <div
      className={[
        "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm",
        muted ? "opacity-60" : "opacity-100",
      ].join(" ")}
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
        <span className="text-xl">{icon}</span>
      </div>
      <h4 className="mt-4 text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{desc}</p>
    </div>
  );
}

function SmallCard({ title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{desc}</p>
    </div>
  );
}

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-grid h-5 w-5 place-items-center rounded-full bg-white/15 text-white">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function StatRow({ icon, value, label }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs text-white/80">{label}</p>
      </div>
    </div>
  );
}

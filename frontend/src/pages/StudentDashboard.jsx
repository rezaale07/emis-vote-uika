// pages/StudentDashboard.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../components/StudentNavbar";
import Container from "../components/Container";
import api, { getVotings, checkUserVote } from "../services/api";
import { AuthContext } from "../context/AuthContext";

/* ---------- Util ---------- */
const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/* ---------- Skeleton ---------- */
function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/70 border border-slate-200 shadow-sm animate-pulse overflow-hidden">
      <div className="h-32 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-1/2 bg-slate-200 rounded" />
        <div className="h-3 w-1/3 bg-slate-200 rounded" />
        <div className="h-3 w-2/3 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

/* ---------- Voting Card ---------- */
function VotingCard({ voting, onClick }) {
  const isActive = voting.status === "active";
  const hasVoted = voting.hasVoted;

  return (
    <button
      onClick={onClick}
      className={[
        "group w-full text-left rounded-2xl bg-white border border-slate-200",
        "shadow-sm hover:shadow-lg hover:-translate-y-[3px]",
        "transition-all duration-200 overflow-hidden flex flex-col",
      ].join(" ")}
    >
      {/* Poster */}
      {voting.poster_url ? (
        <img
          src={voting.poster_url}
          alt={voting.title}
          className="h-40 w-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
        />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-4xl">
          🗳️
        </div>
      )}

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-slate-900 text-sm md:text-base line-clamp-2">
            {voting.title}
          </h3>

          <span
            className={[
              "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
              "shrink-0",
              hasVoted
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200",
            ].join(" ")}
          >
            {hasVoted ? "SUDAH VOTING" : voting.status?.toUpperCase()}
          </span>
        </div>

        {voting.description && (
          <p className="text-xs text-slate-500 line-clamp-2">
            {voting.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          {voting.start_date && (
            <span>Mulai: {formatDate(voting.start_date)}</span>
          )}

          {typeof voting.total_votes === "number" && (
            <span>Total suara: {voting.total_votes}</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
          <span
            className={[
              "inline-flex items-center gap-1",
              hasVoted
                ? "text-blue-600"
                : isActive
                ? "text-emerald-600"
                : "text-slate-500",
            ].join(" ")}
          >
            {hasVoted ? "Lihat hasil voting" : isActive ? "Ikuti sekarang" : "Voting sudah ditutup"}
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------- Event Card ---------- */
function EventCard({ event, onClick }) {
  const d = event.date ? formatDate(event.date) : null;

  return (
    <button
      onClick={onClick}
      className={[
        "group w-full text-left rounded-2xl bg-white border border-slate-200",
        "shadow-sm hover:shadow-lg hover:-translate-y-[3px]",
        "transition-all duration-200 overflow-hidden flex flex-col",
      ].join(" ")}
    >
      {event.poster_url ? (
        <img
          src={event.poster_url}
          alt={event.title}
          className="h-40 w-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
        />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-sky-100 to-slate-100 flex items-center justify-center text-4xl">
          🎓
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-semibold text-slate-900 text-sm md:text-base line-clamp-2">
          {event.title}
        </h3>

        {event.location && (
          <p className="text-xs text-slate-500 line-clamp-1">
            Lokasi: {event.location}
          </p>
        )}

        {d && (
          <p className="text-xs text-slate-500">Tanggal: {d}</p>
        )}

        <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-blue-600">
          <span className="inline-flex items-center gap-1">
            Lihat detail event
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------- Page ---------- */
export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [votings, setVotings] = useState([]);
  const [events, setEvents] = useState([]);

  const firstName = (user?.name || "Mahasiswa").split(" ")[0];

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);

        const [eventRes, votingRes] = await Promise.all([
          api.get("/events"),
          getVotings(),
        ]);

        if (!active) return;

        const eventsData = Array.isArray(eventRes.data) ? eventRes.data : [];
        const votingList = Array.isArray(votingRes.data) ? votingRes.data : [];

        // Tambah info "sudah vote" untuk tiap voting
        const withStatus = await Promise.all(
          votingList.map(async (v) => {
            try {
              const check = await checkUserVote(v.id, Number(localStorage.getItem("user_id")));
              return {
                ...v,
                hasVoted: check.data?.voted ?? false,
              };
            } catch {
              return { ...v, hasVoted: false };
            }
          })
        );

        setEvents(
          [...eventsData].sort(
            (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
          )
        );
        setVotings(
          [...withStatus].sort(
            (a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0)
          )
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const activeVotings = votings.filter((v) => v.status === "active");
  const upcomingEvents = events; // kalau mau bisa difilter event yang akan datang saja

  const totalJoinedVotings = votings.filter((v) => v.hasVoted).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <main className="pb-10">
        <Container className="pt-6 md:pt-8 space-y-8 md:space-y-10">
          {/* HERO / WELCOME */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />

            <div className="relative px-5 py-5 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-100/90">
                  EMIS-Vote UIKA
                </p>
                <h1 className="mt-1 text-2xl md:text-3xl font-semibold">
                  Halo, {firstName} 👋
                </h1>
                <p className="mt-1 text-sm md:text-base text-blue-50/90 max-w-xl">
                  Berikut ringkasan voting dan event kampus yang bisa kamu ikuti.
                  Tetap aktif berpartisipasi dalam kegiatan kampus ya!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs md:text-sm">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md px-3 py-2 border border-white/20">
                  <p className="text-[11px] uppercase tracking-wide text-blue-100">
                    Voting Aktif
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {activeVotings.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-md px-3 py-2 border border-white/20">
                  <p className="text-[11px] uppercase tracking-wide text-blue-100">
                    Voting Diikuti
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {totalJoinedVotings}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-md px-3 py-2 border border-white/20 hidden sm:block">
                  <p className="text-[11px] uppercase tracking-wide text-blue-100">
                    Event Kampus
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {upcomingEvents.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* VOTING SECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-900 flex items-center gap-2">
                  Voting Aktif
                  <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {activeVotings.length} sesi
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Pilih voting yang ingin kamu ikuti atau lihat hasil voting
                  yang sudah kamu ikuti.
                </p>
              </div>

              <button
                onClick={() => navigate("/student/voting")}
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
              >
                Lihat Semua →
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : activeVotings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-8 px-4 text-center text-sm text-slate-500">
                Belum ada voting aktif saat ini. Cek kembali beberapa waktu
                lagi.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeVotings.slice(0, 3).map((v) => (
                  <VotingCard
                    key={v.id}
                    voting={v}
                    onClick={() =>
                      v.hasVoted
                        ? navigate(`/student/voting/${v.id}/results`)
                        : navigate(`/student/voting/${v.id}`)
                    }
                  />
                ))}
              </div>
            )}

            {/* Mobile "Lihat semua" */}
            {!loading && activeVotings.length > 0 && (
              <div className="sm:hidden flex justify-end">
                <button
                  onClick={() => navigate("/student/voting")}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                >
                  Lihat Semua →
                </button>
              </div>
            )}
          </section>

          {/* EVENTS SECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                  Event Kampus
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Ikuti berbagai kegiatan kampus yang sedang berlangsung atau
                  akan datang.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-8 px-4 text-center text-sm text-slate-500">
                Belum ada event kampus terdaftar.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcomingEvents.slice(0, 3).map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    onClick={() => navigate(`/event/${e.id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* FOOTER */}
          <p className="pt-4 text-center text-[11px] text-slate-400">
            © UIKA IT Division — EMIS-Vote UIKA
          </p>
        </Container>
      </main>
    </div>
  );
}

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
      className="group w-full text-left rounded-2xl bg-white border border-slate-200
                 shadow-sm hover:shadow-xl hover:-translate-y-1
                 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {voting.poster_url ? (
        <img
          src={voting.poster_url}
          alt={voting.title}
          className="h-40 w-full object-cover group-hover:scale-[1.03] transition-transform"
        />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-4xl">
          🗳️
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-slate-900 text-sm md:text-base line-clamp-2">
            {voting.title}
          </h3>

          <span
            className={[
              "px-3 py-1 rounded-full text-[11px] font-semibold border shrink-0",
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

        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
          {voting.start_date && <span>Mulai: {formatDate(voting.start_date)}</span>}
          {typeof voting.total_votes === "number" && (
            <span>Total suara: {voting.total_votes}</span>
          )}
        </div>

        <div className="mt-3 text-[11px] font-medium">
          <span
            className={
              hasVoted
                ? "text-blue-600"
                : isActive
                ? "text-emerald-600"
                : "text-slate-500"
            }
          >
            {hasVoted
              ? "Lihat hasil voting"
              : isActive
              ? "Ikuti sekarang"
              : "Voting sudah ditutup"}{" "}
            →
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
      className="group w-full text-left rounded-2xl bg-white border border-slate-200
                 shadow-sm hover:shadow-xl hover:-translate-y-1
                 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {event.poster_url ? (
        <img
          src={event.poster_url}
          alt={event.title}
          className="h-40 w-full object-cover group-hover:scale-[1.03] transition-transform"
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
          <p className="text-xs text-slate-500">Lokasi: {event.location}</p>
        )}
        {d && <p className="text-xs text-slate-500">Tanggal: {d}</p>}

        <div className="mt-3 text-[11px] font-medium text-blue-600">
          Lihat detail event →
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

        const votingList = votingRes.data || [];
        const withStatus = await Promise.all(
          votingList.map(async (v) => {
            try {
              const check = await checkUserVote(
                v.id,
                Number(localStorage.getItem("user_id"))
              );
              return { ...v, hasVoted: check.data?.voted ?? false };
            } catch {
              return { ...v, hasVoted: false };
            }
          })
        );

        setEvents(eventRes.data || []);
        setVotings(withStatus);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => (active = false);
  }, []);

  const activeVotings = votings.filter((v) => v.status === "active");
  const joinedCount = votings.filter((v) => v.hasVoted).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <main className="pb-12">
        <Container className="pt-8 space-y-10">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.15),transparent_45%)]" />

            <div className="relative px-8 py-10 grid md:grid-cols-2 gap-8 items-center">
              {/* LEFT */}
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-blue-100">
                  EMIS-Vote UIKA
                </p>
                <h1 className="mt-2 text-3xl font-semibold">
                  Halo, {firstName} 👋
                </h1>
                <p className="mt-3 text-blue-50/90 max-w-xl">
                  Berikut ringkasan voting dan event kampus yang bisa kamu ikuti.
                  Tetap aktif berpartisipasi dalam kegiatan kampus ya!
                </p>
              </div>

              {/* RIGHT – STATS */}
              <div className="flex justify-end">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    ["Voting Aktif", activeVotings.length],
                    ["Voting Diikuti", joinedCount],
                    ["Event Kampus", events.length],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-white/15 backdrop-blur-md
                                 px-6 py-4 border border-white/20 text-center"
                    >
                      <p className="text-[10px] uppercase tracking-widest text-blue-100">
                        {label}
                      </p>
                      <div className="h-10 flex items-center justify-center">
                        <span className="text-3xl font-extrabold tracking-tight drop-shadow">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* VOTING */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Voting Aktif</h2>
              <button
                onClick={() => navigate("/student/voting")}
                className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200"
              >
                Lihat Semua →
              </button>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
          </section>

          {/* EVENTS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Event Kampus</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.slice(0, 3).map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  onClick={() => navigate(`/event/${e.id}`)}
                />
              ))}
            </div>
          </section>

          <p className="text-center text-[11px] text-slate-400">
            © UIKA IT Division — EMIS-Vote UIKA
          </p>
        </Container>
      </main>
    </div>
  );
}

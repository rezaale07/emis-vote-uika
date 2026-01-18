import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentNavbar from "../components/StudentNavbar";
import Container from "../components/Container";
import { getVotingById } from "../services/api";

export default function VotingResultsStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    let mounted = true;

    setLoading(true);
    getVotingById(id)
      .then((res) => mounted && setVoting(res.data))
      .catch(() => mounted && setVoting(null))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [id]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-40 bg-slate-300 rounded-2xl" />
            <div className="h-56 bg-slate-200 rounded-2xl" />
          </div>
        </Container>
      </div>
    );
  }

  /* ================= NOT FOUND ================= */
  if (!voting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-14 text-center">
          <h1 className="text-xl font-semibold text-slate-800">
            Voting tidak ditemukan
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Data voting tidak tersedia atau sudah dihapus.
          </p>
          <button
            onClick={() => navigate("/student/voting")}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow"
          >
            ← Kembali ke daftar voting
          </button>
        </Container>
      </div>
    );
  }

  /* ================= DATA ================= */
  const options = [...(voting.options || [])].sort(
    (a, b) => (b.votes_count || 0) - (a.votes_count || 0)
  );

  const total =
    voting.total_votes ??
    options.reduce((s, o) => s + (o.votes_count || 0), 0);

  const winnerId = options.length ? options[0].id : null;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      <StudentNavbar />

      <Container className="py-8 md:py-10 space-y-8">

        {/* BACK */}
        <button
          onClick={() => navigate("/student/voting")}
          className="text-xs text-slate-600 hover:text-slate-800"
        >
          ← Kembali ke daftar voting
        </button>

        {/* ================= HERO ================= */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 text-white shadow relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-20" />

          <div className="relative">
            <p className="text-[11px] tracking-[0.25em] uppercase opacity-80">
              Hasil Voting
            </p>

            <h1 className="mt-1 text-2xl md:text-3xl font-bold">
              {voting.title}
            </h1>

            {voting.description && (
              <p className="mt-2 text-blue-100 max-w-2xl text-sm md:text-base">
                {voting.description}
              </p>
            )}

            <div className="mt-5 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-xs font-semibold">
              Total Suara: <span className="font-bold">{total}</span>
            </div>
          </div>
        </div>

        {/* ================= RESULTS ================= */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Rincian Hasil Kandidat
          </h2>

          {total === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              Belum ada suara masuk.
            </div>
          ) : (
            <div className="space-y-5">
              {options.map((o, idx) => {
                const count = o.votes_count || 0;
                const percent = total ? Math.round((count / total) * 100) : 0;
                const isWinner = o.id === winnerId;

                return (
                  <div
                    key={o.id}
                    className={[
                      "result-item flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border transition",
                      isWinner
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {/* RANK */}
                    <div
                      className={[
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                        isWinner
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600",
                      ].join(" ")}
                    >
                      {idx + 1}
                    </div>

                    {/* PHOTO */}
                    <img
                      src={
                        o.photo_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          o.name || "?"
                        )}`
                      }
                      alt={o.name}
                      className="w-14 h-14 rounded-full object-cover border shadow-sm"
                    />

                    {/* BAR */}
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-slate-900">
                          {o.name}
                        </p>
                        <span className="text-xs text-slate-600">
                          {percent}% {isWinner && "🏆"}
                        </span>
                      </div>

                      <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={[
                            "h-full rounded-full transition-all duration-500",
                            isWinner ? "bg-blue-600" : "bg-blue-400",
                          ].join(" ")}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* COUNT */}
                    <div className="w-12 text-right">
                      <p className="font-semibold text-slate-900">{count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>

      <footer className="text-xs text-center text-slate-400 py-6">
        © UIKA IT Division — All Rights Reserved
      </footer>

      {/* ================= ANIMATION ================= */}
      <style>{`
        .fade-in {
          animation: fadeIn .3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-item {
          opacity: 0;
          transform: translateY(8px);
          animation: rise .35s ease-out forwards;
        }
        .result-item:nth-child(1) { animation-delay: .05s }
        .result-item:nth-child(2) { animation-delay: .10s }
        .result-item:nth-child(3) { animation-delay: .15s }
        .result-item:nth-child(4) { animation-delay: .20s }

        @keyframes rise {
          to { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

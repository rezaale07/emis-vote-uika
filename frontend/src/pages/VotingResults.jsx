import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function VotingResults() {
  const { id: votingId } = useParams();
  const navigate = useNavigate();

  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ====================== LOAD DATA ======================= */
  useEffect(() => {
    setLoading(true);

    api
      .get(`/votings/${votingId}`)
      .then((res) => setVoting(res.data))
      .catch(() => setVoting(null))
      .finally(() => setLoading(false));
  }, [votingId]);

  /* ====================== PREP DATA ======================= */
  const { options, total, winnerId } = useMemo(() => {
    const sorted = [...((voting && voting.options) || [])].sort(
      (a, b) => (b.votes_count || 0) - (a.votes_count || 0)
    );

    const computedTotal =
      (voting && voting.total_votes) ??
      sorted.reduce((sum, o) => sum + (o.votes_count || 0), 0);

    return {
      options: sorted,
      total: computedTotal,
      winnerId: sorted.length ? sorted[0].id : null,
    };
  }, [voting]);

  /* ====================== UI ======================= */
  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      {/* SAME NAVBAR AS DASHBOARD */}
      <Navbar title="Voting Results" />

      {/* SAME SHELL AS DASHBOARD */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main className="rounded-2xl border bg-white p-6 shadow-sm">
          {/* TOP ACTION */}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Kembali
          </button>

          {/* LOADING */}
          {loading ? (
            <div className="mt-6 animate-pulse space-y-6">
              <div className="h-28 bg-gray-100 rounded-2xl" />
              <div className="h-56 bg-gray-50 rounded-2xl border" />
            </div>
          ) : !voting ? (
            /* NOT FOUND */
            <div className="mt-6 rounded-2xl border bg-gray-50 py-14 text-center">
              <p className="text-gray-500 italic">Voting tidak ditemukan.</p>
            </div>
          ) : (
            <>
              {/* HERO */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 md:p-7 text-white shadow">
                <p className="text-[11px] tracking-[0.25em] uppercase opacity-80">
                  Rekapitulasi Voting
                </p>

                <h1 className="mt-2 text-2xl md:text-3xl font-bold">
                  {voting.title}
                </h1>

                {voting.description && (
                  <p className="text-blue-100 mt-2 max-w-2xl">
                    {voting.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-full text-xs font-semibold bg-white/20">
                    Total Suara: <b>{total}</b>
                  </span>

                  {winnerId && options[0] && (
                    <span className="px-4 py-2 rounded-full text-xs font-semibold bg-white/20">
                      🏆 Pemenang Sementara: <b>{options[0].name}</b>
                    </span>
                  )}
                </div>
              </div>

              {/* RESULT LIST */}
              <div className="mt-6 rounded-2xl border bg-white">
                <div className="px-5 pt-5 pb-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Detail Hasil Per Kandidat
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Urutan berdasarkan jumlah suara terbanyak.
                  </p>
                </div>

                {total === 0 ? (
                  <div className="py-14 text-center text-gray-500">
                    Belum ada suara masuk.
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    {options.map((o, idx) => {
                      const count = o.votes_count || 0;
                      const percent = total
                        ? Math.round((count / total) * 100)
                        : 0;
                      const isWinner = o.id === winnerId;

                      return (
                        <div
                          key={o.id}
                          className={[
                            "result-item flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl border transition",
                            isWinner
                              ? "bg-blue-50 border-blue-200"
                              : "border-gray-200 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          {/* RANK */}
                          <div
                            className={[
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                              isWinner
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700",
                            ].join(" ")}
                          >
                            {idx + 1}
                          </div>

                          {/* PHOTO */}
                          <img
                            src={
                              o.photo_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                o.name
                              )}&background=random`
                            }
                            className="w-14 h-14 rounded-full object-cover border shadow-sm"
                            alt={o.name}
                            loading="lazy"
                          />

                          {/* BAR */}
                          <div className="flex-1 w-full">
                            <div className="flex justify-between items-center">
                              <p className="font-semibold text-gray-900">
                                {o.name}
                              </p>
                              <span className="text-xs text-gray-600">
                                {percent}% {isWinner && "🏆"}
                              </span>
                            </div>

                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={[
                                  "h-full rounded-full transition-all",
                                  isWinner ? "bg-blue-600" : "bg-blue-400",
                                ].join(" ")}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* COUNT */}
                          <div className="w-12 text-right">
                            <p className="font-semibold text-gray-900">
                              {count}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ANIMATION */}
              <style>{`
                .fade-in { animation: fadeIn .25s ease-out; }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(4px); }
                  to   { opacity: 1; transform: translateY(0); }
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

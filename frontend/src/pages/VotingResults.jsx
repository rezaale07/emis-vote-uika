// pages/VotingResults.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../layouts/AdminLayout";

export default function VotingResults() {
  const { id: votingId } = useParams();

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

  /* ====================== LOADING UI ====================== */
  if (loading) {
    return (
      <AdminLayout title="Voting Results">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  /* ====================== NOT FOUND ====================== */
  if (!voting) {
    return (
      <AdminLayout title="Voting Results">
        <div className="bg-white rounded-xl p-6 shadow text-center border">
          Voting tidak ditemukan.
        </div>
      </AdminLayout>
    );
  }

  /* ====================== PREP DATA ======================= */
  const options = [...(voting.options || [])].sort(
    (a, b) => (b.votes_count || 0) - (a.votes_count || 0)
  );

  const total =
    voting.total_votes ??
    options.reduce((sum, o) => sum + (o.votes_count || 0), 0);

  const winnerId = options.length ? options[0].id : null;

  /* ========================== UI ========================== */
  return (
    <AdminLayout title="Voting Results">
      <div className="space-y-8 fade-in">

        {/* ================= HERO SUMMARY ================= */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow text-white overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-10"></div>

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.25em] opacity-80">
              Rekapitulasi Voting
            </p>

            <h1 className="text-3xl font-bold mt-1">{voting.title}</h1>

            {voting.description && (
              <p className="text-blue-100 mt-2 max-w-2xl">{voting.description}</p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <div className="bg-white/20 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
                <span>Total Suara:</span>
                <span className="text-white font-bold">{total}</span>
              </div>

              {winnerId && (
                <div className="bg-white/20 px-4 py-2 rounded-full text-xs font-semibold">
                  🏆 Pemenang Sementara:{" "}
                  <span className="font-bold">
                    {options[0].name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RESULTS LIST ================= */}
        <div className="bg-white border shadow-sm rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Detail Hasil Per Kandidat
          </h2>

          {total === 0 && (
            <div className="py-10 text-center text-gray-500">
              Belum ada suara masuk.
            </div>
          )}

          <div className="space-y-6">
            {options.map((o, idx) => {
              const count = o.votes_count || 0;
              const percent = total ? Math.round((count / total) * 100) : 0;
              const isWinner = o.id === winnerId;

              return (
                <div
                  key={o.id}
                  className={[
                    "flex flex-col sm:flex-row items-center gap-5 p-5 rounded-xl border transition-all result-item",
                    isWinner
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {/* Rank */}
                  <div
                    className={[
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm",
                      isWinner
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700",
                    ].join(" ")}
                  >
                    {idx + 1}
                  </div>

                  {/* Photo */}
                  <img
                    src={
                      o.photo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        o.name
                      )}&background=random`
                    }
                    className="w-14 h-14 rounded-full object-cover border shadow-sm"
                    alt={o.name}
                  />

                  {/* Bar */}
                  <div className="flex-1 w-full">
                    <div className="flex justify-between pr-2 items-center">
                      <p className="font-semibold text-gray-900">{o.name}</p>
                      <span className="text-xs text-gray-600">
                        {percent}% {isWinner && "🏆"}
                      </span>
                    </div>

                    <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className={[
                          "h-full rounded-full transition-all",
                          isWinner ? "bg-blue-600" : "bg-blue-400",
                        ].join(" ")}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Count */}
                  <div className="text-right w-12">
                    <p className="font-semibold text-gray-900">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =============== ANIMATION =============== */}
        <style>{`
          .fade-in {
            animation: fadeIn .3s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .result-item {
            opacity: 0;
            transform: translateY(6px);
            animation: rise .45s ease-out forwards;
          }
          .result-item:nth-child(1) { animation-delay: .05s }
          .result-item:nth-child(2) { animation-delay: .10s }
          .result-item:nth-child(3) { animation-delay: .15s }
          .result-item:nth-child(4) { animation-delay: .20s }

          @keyframes rise {
            from { opacity:0; transform: translateY(10px); }
            to   { opacity:1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}

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

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    getVotingById(id)
      .then((res) => {
        if (!isMounted) return;
        setVoting(res.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setVoting(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-8 md:py-10">
          <div className="h-8 w-24 bg-slate-200 rounded-lg mb-4 animate-pulse" />
          <div className="animate-pulse space-y-4">
            <div className="h-28 bg-slate-300 rounded-2xl" />
            <div className="h-40 bg-slate-200 rounded-2xl" />
          </div>
        </Container>
      </div>
    );
  }

  // ================= NOT FOUND =================
  if (!voting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-10 text-center">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-800 mb-3">
            Data voting tidak ditemukan
          </h1>
          <p className="text-slate-500 text-sm md:text-base mb-6">
            Voting yang Anda cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <button
            onClick={() => navigate("/student/voting")}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white text-xs md:text-sm font-medium hover:bg-blue-700 transition"
          >
            ← Kembali ke daftar voting
          </button>
        </Container>
      </div>
    );
  }

  // ================= DATA =================
  const optionsSorted = [...(voting.options || [])].sort(
    (a, b) => (b.votes_count || 0) - (a.votes_count || 0)
  );

  const total =
    voting.total_votes ??
    optionsSorted.reduce((sum, o) => sum + (o.votes_count || 0), 0);

  const winnerId = optionsSorted.length > 0 ? optionsSorted[0].id : null;

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      <StudentNavbar />

      <Container className="py-8 md:py-10">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/student/voting")}
          className="mb-5 bg-white shadow-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition text-xs font-medium text-slate-700"
        >
          ← Kembali
        </button>

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 md:p-7 mb-8 shadow relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-20" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">
              Hasil Voting Kampus
            </p>

            <h1 className="mt-1 text-2xl md:text-3xl font-semibold">
              {voting.title}
            </h1>

            {voting.description && (
              <p className="mt-1 text-sm md:text-base text-blue-50/90 max-w-2xl">
                {voting.description}
              </p>
            )}

            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-xs font-medium">
              Total Suara: <span className="font-bold">{total}</span>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h2 className="font-semibold mb-6 text-slate-900 text-lg">
            Rincian Hasil Kandidat
          </h2>

          {total === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              Belum ada suara masuk.
            </div>
          ) : (
            <div className="space-y-5">
              {optionsSorted.map((o, idx) => {
                const count = o.votes_count || 0;
                const percent = total ? Math.round((count / total) * 100) : 0;
                const isWinner = o.id === winnerId;

                return (
                  <div
                    key={o.id}
                    className={[
                      "result-item flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border transition-all duration-200",
                      isWinner
                        ? "border-blue-300 bg-blue-50 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {/* Rank */}
                    <div
                      className={[
                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                        isWinner
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 border border-blue-200 text-blue-700",
                      ].join(" ")}
                    >
                      {idx + 1}
                    </div>

                    {/* Photo */}
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

                    {/* Bar */}
                    <div className="flex-1 w-full">
                      <div className="flex justify-between pr-2 items-center">
                        <p className="font-semibold text-slate-900">{o.name}</p>

                        <span className="text-xs text-slate-600">
                          {percent}% {isWinner && "🏆"}
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className={[
                            "h-full rounded-full transition-all duration-500",
                            isWinner ? "bg-blue-600" : "bg-blue-400",
                          ].join(" ")}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Count */}
                    <div className="text-right w-14">
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

      {/* Animation */}
      <style>{`
        .fade-in { animation: fadeIn .3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-item {
          opacity: 0;
          transform: translateY(6px);
          animation: fadeInUp 0.3s ease-out forwards;
        }
        .result-item:nth-child(1) { animation-delay: 0.05s; }
        .result-item:nth-child(2) { animation-delay: 0.10s; }
        .result-item:nth-child(3) { animation-delay: 0.15s; }
        .result-item:nth-child(4) { animation-delay: 0.20s; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

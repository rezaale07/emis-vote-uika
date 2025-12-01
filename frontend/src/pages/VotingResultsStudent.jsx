import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentNavbar from "../components/StudentNavbar";
import { getVotingById } from "../services/api";

export default function VotingResultsStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVotingById(id)
      .then((res) => setVoting(res.data))
      .catch((err) => {
        console.error(err);
        setVoting(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-4">
          <div className="h-32 bg-slate-300 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="max-w-4xl mx-auto p-6 text-center text-slate-600">
          Data voting tidak ditemukan.
        </div>
      </div>
    );
  }

  const total = voting.total_votes || 0;
  const options = (voting.options || []).slice().sort((a, b) => {
    return (b.votes_count || 0) - (a.votes_count || 0);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 bg-white shadow-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition text-xs font-medium text-slate-700"
        >
          ← Kembali
        </button>

        {/* Header card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 md:p-7 mb-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] opacity-80">
            Hasil Voting
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold">
            {voting.title}
          </h1>
          {voting.description && (
            <p className="mt-1 text-sm md:text-base text-blue-50/90 max-w-2xl">
              {voting.description}
            </p>
          )}

          <div className="mt-4 inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs">
            <span className="font-medium">Total Votes:</span>
            <span className="font-bold">{total}</span>
          </div>
        </div>

        {/* Result detail */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-7">
          <h2 className="font-semibold mb-4 text-slate-900 text-lg">
            Rincian Hasil
          </h2>

          {total === 0 && (
            <div className="py-10 text-center text-slate-500 text-sm">
              Belum ada suara masuk. Tunggu mahasiswa lain memilih.
            </div>
          )}

          <div className="space-y-5">
            {options.map((o, idx) => {
              const count = o.votes_count || 0;
              const percent = total ? Math.round((count / total) * 100) : 0;

              return (
                <div
                  key={o.id}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                >
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700 text-sm">
                    {idx + 1}
                  </div>

                  {/* Foto */}
                  <img
                    src={
                      o.photo_url ||
                      "https://source.unsplash.com/80x80/?portrait"
                    }
                    alt={o.name}
                    className="w-14 h-14 rounded-full object-cover border border-white shadow-sm"
                  />

                  {/* Bar */}
                  <div className="flex-1 w-full">
                    <div className="flex justify-between gap-2 items-baseline">
                      <div className="font-semibold text-slate-900 text-sm md:text-base">
                        {o.name}
                      </div>
                      <div className="hidden sm:block text-xs text-slate-500">
                        {percent}%
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="text-right w-20 sm:w-16">
                    <div className="font-semibold text-slate-900 text-sm">
                      {count}
                    </div>
                    <div className="text-xs text-slate-500 sm:hidden">
                      {percent}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="text-xs text-center text-slate-400 py-6">
        Powered by UIKA IT Division
      </footer>
    </div>
  );
}

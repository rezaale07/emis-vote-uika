import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Swal from "sweetalert2";

// ===============================
// Skeleton Card
// ===============================
function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded-md" />
      <div className="mt-3 h-8 w-16 bg-gray-300 rounded-md" />
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <div className="mt-1 text-3xl font-bold text-gray-800">
        {value ?? 0}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [eventsCount, setEventsCount] = useState(null);
  const [studentsCount, setStudentsCount] = useState(null);
  const [totalVotesAll, setTotalVotesAll] = useState(null);
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [evRes, stRes, votRes] = await Promise.all([
        api.get("/events"),
        api.get("/students"),
        api.get("/votings"),
      ]);

      const events = Array.isArray(evRes.data) ? evRes.data : [];
      const students = Array.isArray(stRes.data) ? stRes.data : [];
      const votList = Array.isArray(votRes.data) ? votRes.data : [];

      setEventsCount(events.length);
      setStudentsCount(students.length);

      if (!votList.length) {
        setVotings([]);
        setTotalVotesAll(0);
        return;
      }

      const detailResponses = await Promise.all(
        votList.map((v) => api.get(`/votings/${v.id}`))
      );

      let totalAll = 0;

      const enriched = detailResponses.map((res) => {
        const detail = res.data;
        const totalVotes =
          detail.total_votes ??
          (detail.options || []).reduce(
            (sum, o) => sum + (o.votes_count || 0),
            0
          );

        totalAll += totalVotes;

        return { ...detail, total_votes: totalVotes };
      });

      enriched.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setVotings(enriched);
      setTotalVotesAll(totalAll);
    } catch (err) {
      console.error("Dashboard load error:", err);

      // ===============================
      // ⚠️ SWEETALERT - ERROR + RETRY
      // ===============================
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Dashboard",
        text: "Terjadi kesalahan saat mengambil data. Coba lagi?",
        showCancelButton: true,
        confirmButtonText: "Coba Lagi",
        cancelButtonText: "Batal",
        confirmButtonColor: "#2563eb",
      }).then((result) => {
        if (result.isConfirmed) {
          loadDashboard();
        }
      });

      setEventsCount(0);
      setStudentsCount(0);
      setTotalVotesAll(0);
      setVotings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Admin Dashboard" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto space-y-6">

          {/* TITLE */}
          <h2 className="text-xl font-semibold text-gray-900">Statistik Sistem</h2>

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <StatCard label="Total Events" value={eventsCount} icon="📅" />
                <StatCard label="Total Mahasiswa" value={studentsCount} icon="🎓" />
                <StatCard label="Total Votes Masuk" value={totalVotesAll} icon="🗳️" />
              </>
            )}
          </div>

          {/* LIST VOTING */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Daftar Voting</h3>
                <p className="text-sm text-gray-500">
                  Klik tombol "Lihat Hasil" untuk melihat rincian suara.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse mt-4">
                <div className="h-20 rounded-2xl bg-gray-100" />
                <div className="h-20 rounded-2xl bg-gray-100" />
              </div>
            ) : votings.length === 0 ? (
              <div className="mt-4 text-sm text-gray-500">Belum ada data voting.</div>
            ) : (
              <div className="space-y-3 mt-4">
                {votings.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {v.poster_url ? (
                        <img
                          src={v.poster_url}
                          alt={v.title}
                          className="w-16 h-16 rounded-xl object-cover shadow-sm border"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                          No Poster
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 text-sm md:text-base">
                            {v.title}
                          </h4>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                              v.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {v.status?.toUpperCase()}
                          </span>
                        </div>

                        {v.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {v.description}
                          </p>
                        )}

                        <p className="text-xs text-slate-600 mt-1">
                          Total Suara:{" "}
                          <span className="font-semibold">{v.total_votes}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/admin/results/${v.id}`)}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm"
                    >
                      Lihat Hasil →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

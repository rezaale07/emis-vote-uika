import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import Swal from "sweetalert2";

/* ===============================
   UI COMPONENTS
=============================== */
function SkeletonBox({ className }) {
  return <div className={`animate-pulse rounded-3xl bg-slate-100 ${className}`} />;
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value ?? 0}</p>
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
          (detail.options || []).reduce((sum, o) => sum + (o.votes_count || 0), 0);

        totalAll += totalVotes;

        return { ...detail, total_votes: totalVotes };
      });

      enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setVotings(enriched);
      setTotalVotesAll(totalAll);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Dashboard",
        text: "Terjadi kesalahan saat mengambil data.",
        confirmButtonColor: "#2563eb",
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
    <AdminLayout title="Admin Dashboard" subtitle="Ringkasan Sistem">
      <div className="space-y-6 fade-in">
        {/* HEADER */}
        <div>
          <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
            Ringkasan Sistem
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pantau statistik event, mahasiswa, dan voting kampus.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <>
              <SkeletonBox className="h-28" />
              <SkeletonBox className="h-28" />
              <SkeletonBox className="h-28" />
            </>
          ) : (
            <>
              <StatCard label="Total Event" value={eventsCount} icon="📅" />
              <StatCard label="Total Mahasiswa" value={studentsCount} icon="🎓" />
              <StatCard label="Total Suara Masuk" value={totalVotesAll} icon="🗳️" />
            </>
          )}
        </div>

        {/* VOTING LIST */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Daftar Voting</h2>
            <p className="text-sm text-slate-500">
              Klik voting untuk melihat hasil suara.
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              <SkeletonBox className="h-20" />
              <SkeletonBox className="h-20" />
            </div>
          ) : votings.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data voting.</p>
          ) : (
            <div className="space-y-3">
              {votings.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-4">
                    {v.poster_url ? (
                      <img
                        src={v.poster_url}
                        alt={v.title}
                        className="w-16 h-16 rounded-xl object-cover border shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                        No Poster
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{v.title}</h3>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            v.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {v.status?.toUpperCase()}
                        </span>
                      </div>

                      {v.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">
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
                    onClick={() => navigate(`/admin/voting/${v.id}/results`)}
                    className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    Lihat Hasil →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AdminLayout>
  );
}

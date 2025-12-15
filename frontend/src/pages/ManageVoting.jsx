import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { deleteVoting } from "../services/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// =========================
// ⭐ Skeleton
// =========================
function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm animate-pulse flex items-center gap-4">
      <div className="w-24 h-24 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="hidden md:flex gap-2">
        <div className="h-9 w-28 bg-gray-200 rounded-xl" />
        <div className="h-9 w-20 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function ManageVoting() {
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadVoting = () => {
    setLoading(true);
    api
      .get("/votings")
      .then((res) => setVotings(Array.isArray(res.data) ? res.data : []))
      .catch(() =>
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal mengambil voting.",
          confirmButtonColor: "#2563eb",
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVoting();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Voting?",
      text: "Voting yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "rounded-2xl",
        confirmButton:
          "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700",
        cancelButton:
          "bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300",
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteVoting(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Voting berhasil dihapus.",
        timer: 1300,
        showConfirmButton: false,
      });
      loadVoting();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus voting.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const statusMeta = (status) => {
    const base = "px-3 py-1.5 text-xs rounded-full font-semibold border";
    const map = {
      active: {
        cls: `${base} bg-emerald-50 text-emerald-700 border-emerald-200`,
        label: "ACTIVE",
      },
      closed: {
        cls: `${base} bg-rose-50 text-rose-700 border-rose-200`,
        label: "CLOSED",
      },
      draft: {
        cls: `${base} bg-slate-100 text-slate-700 border-slate-200`,
        label: "DRAFT",
      },
    };
    return map[status] || {
      cls: `${base} bg-slate-100 text-slate-700 border-slate-200`,
      label: String(status || "UNKNOWN").toUpperCase(),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Navbar title="Manage Voting" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main className="rounded-2xl border bg-white p-6 shadow-sm">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
                EMIS-Vote UIKA
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
                Voting Sessions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Kelola sesi voting, tambahkan event vote, edit dan lihat hasil.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/voting/add")}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium shadow hover:bg-blue-700 transition"
            >
              + Create Voting
            </button>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : votings.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-gray-50 py-14 text-center">
              <p className="text-gray-500 italic">Belum ada voting.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {votings.map((v) => {
                const s = statusMeta(v.status);

                return (
                  <li
                    key={v.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0">
                        {v.poster_url ? (
                          <img
                            src={v.poster_url}
                            alt={v.title}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border bg-gray-100"
                          />
                        ) : (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border bg-gray-50 flex items-center justify-center text-2xl">
                            🗳️
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                            {v.title}
                          </h3>
                          <span className={s.cls}>{s.label}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-gray-500">
                          {typeof v.total_votes !== "undefined" && (
                            <span className="px-3 py-1 rounded-full bg-gray-50 border">
                              {v.total_votes} total votes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                      <button
                        onClick={() => navigate(`/admin/voting/${v.id}/event-vote`)}
                        className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Manage Event Vote
                      </button>

                      <button
                        onClick={() => navigate(`/admin/voting/${v.id}/edit`)}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => navigate(`/admin/results/${v.id}`)}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 transition"
                      >
                        Results
                      </button>

                      <button
                        onClick={() => handleDelete(v.id)}
                        className="rounded-xl border border-red-300 text-red-600 px-4 py-2 text-sm hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

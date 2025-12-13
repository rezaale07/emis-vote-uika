import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { deleteVoting } from "../services/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// =========================
// ⭐ Premium Skeleton
// =========================
function SkeletonCard() {
  return (
    <div className="rounded-2xl border p-5 bg-white shadow-sm animate-pulse flex items-center gap-4">
      <div className="w-24 h-24 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
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
      .then((res) => setVotings(res.data))
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

  // ============================
  // DELETE POPUP
  // ============================
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
        timer: 1400,
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

  const statusBadge = (status) => {
    const base =
      "px-3 py-1.5 text-xs rounded-full font-semibold border shadow-sm";

    return {
      active: `${base} bg-green-50 text-green-700 border-green-300`,
      closed: `${base} bg-red-50 text-red-600 border-red-300`,
      draft: `${base} bg-gray-100 text-gray-600 border-gray-300`,
    }[status] || `${base} bg-gray-100 text-gray-600 border-gray-300`;
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Voting Sessions
            </h2>

            <button
              onClick={() => navigate("/admin/voting/add")}
              className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700 transition"
            >
              + Create Voting
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : votings.length === 0 ? (
            <p className="text-center py-10 text-gray-500 italic">
              Belum ada voting.
            </p>
          ) : (
            <ul className="space-y-5">
              {votings.map((v) => (
                <li
                  key={v.id}
                  className="rounded-2xl border p-5 bg-white shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* POSTER + INFO */}
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        v.poster_url ||
                        "https://source.unsplash.com/120x120/?vote,people"
                      }
                      className="w-24 h-24 object-cover rounded-xl border shadow-sm bg-gray-50"
                    />

                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {v.title}
                      </div>

                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        <span className={statusBadge(v.status)}>
                          {v.status.toUpperCase()}
                        </span>

                        {v.total_votes !== undefined && (
                          <span className="text-xs text-gray-500">
                            {v.total_votes} total votes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        navigate(`/admin/voting/${v.id}/candidates`)
                      }
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 transition shadow-sm"
                    >
                      Manage Candidates
                    </button>

                    <button
                      onClick={() => navigate(`/admin/voting/${v.id}/edit`)}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 transition shadow-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => navigate(`/admin/results/${v.id}`)}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 transition shadow-sm"
                    >
                      Results
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      className="rounded-xl border border-red-400 text-red-600 px-4 py-2 text-sm hover:bg-red-50 transition shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      {/* ANIMATION */}
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

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Swal from "sweetalert2";

// =========================
// ⭐ Skeleton
// =========================
function EventSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm animate-pulse flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-56" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded-xl" />
        <div className="w-16 h-8 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function ManageEventVote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);

    Promise.all([
      api.get(`/votings/${id}`),
      api.get(`/votings/${id}/options`),
    ])
      .then(([votingRes, optionRes]) => {
        setVoting(votingRes.data);
        setEvents(Array.isArray(optionRes.data) ? optionRes.data : []);
      })
      .catch(() =>
        Swal.fire("Error", "Gagal memuat event voting", "error")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async (optionId) => {
    const confirm = await Swal.fire({
      title: "Hapus Event?",
      text: "Event yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/votings/${id}/options/${optionId}`);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Event berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
      loadData();
    } catch {
      Swal.fire("Gagal", "Tidak dapat menghapus event", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Navbar title="Manage Event Vote" />

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
                Voting Configuration
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Event dalam Voting
              </h2>

              {voting && (
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    {voting.title}
                  </span>{" "}
                  — {events.length} event terdaftar
                </p>
              )}
            </div>

            <button
              onClick={() =>
                navigate(`/admin/voting/${id}/event-vote/add`)
              }
              className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium shadow hover:bg-blue-700 transition"
            >
              + Tambah Event
            </button>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="space-y-4">
              <EventSkeleton />
              <EventSkeleton />
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-gray-50 py-14 text-center">
              <p className="text-gray-500 italic">
                Belum ada event untuk voting ini
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4 min-w-0">
                    {e.photo_url ? (
                      <img
                        src={e.photo_url}
                        alt={e.name}
                        className="w-16 h-16 rounded-xl object-cover border bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border bg-gray-50 flex items-center justify-center text-xl">
                        🎫
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {e.name}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {e.bio || "Tanpa deskripsi event"}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 justify-start md:justify-end">
                    <button
                      onClick={() =>
                        navigate(
                          `/admin/voting/${id}/event-vote/${e.id}/edit`
                        )
                      }
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(e.id)}
                      className="rounded-xl border border-red-300 text-red-600 px-4 py-2 text-sm hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

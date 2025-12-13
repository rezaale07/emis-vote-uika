import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { getEvents, deleteEvent as deleteEventApi } from "../services/api";
import Swal from "sweetalert2";

// ==================================================
// PREMIUM SKELETON ROW
// ==================================================
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b">
      <td className="py-4 px-2">
        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
      </td>
      <td className="py-4 px-2">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </td>
      <td className="py-4 px-2">
        <div className="h-4 w-28 bg-gray-200 rounded"></div>
      </td>
      <td className="py-4 px-2">
        <div className="h-4 w-36 bg-gray-200 rounded"></div>
      </td>
      <td className="py-4 px-2">
        <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
      </td>
      <td className="py-4 px-2">
        <div className="h-8 w-48 bg-gray-200 rounded-xl"></div>
      </td>
    </tr>
  );
}

// ==================================================
// HELPERS
// ==================================================
const normalizeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value) => {
  const d = normalizeDate(value);
  if (!d) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = () => {
    getEvents()
      .then((res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const finalEvents = res.data.map((ev) => {
          const d = normalizeDate(ev.date);
          const isExpired = d ? d < today : false;

          return {
            ...ev,
            status: ev.status ?? (isExpired ? "expired" : "active"),
          };
        });

        setEvents(finalEvents);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Event",
          text: "Terjadi kesalahan saat mengambil data event.",
        });
      })
      .finally(() => setLoading(false));
  };

  const deleteEvent = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Event?",
      text: "Event yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteEventApi(id);

      Swal.fire({
        icon: "success",
        title: "Event Terhapus",
        text: "Event berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchEvents();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: "Terjadi kesalahan saat menghapus event.",
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Manage Events" />

      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN CONTENT */}
        <main className="rounded-2xl border bg-white p-6 shadow-sm fade-in">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Daftar Event</h2>

            <button
              className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition shadow-sm"
              onClick={() => navigate("/admin/events/add")}
            >
              + Add Event
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b bg-gray-50">
                  <th className="py-3 px-2">Poster</th>
                  <th className="py-3 px-2">Judul</th>
                  <th className="py-3 px-2">Tanggal</th>
                  <th className="py-3 px-2">Lokasi</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Aksi</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      Tidak ada event.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr
                      key={ev.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* POSTER */}
                      <td className="py-3 px-2">
                        {ev.poster_url ? (
                          <img
                            src={ev.poster_url}
                            className="w-16 h-16 object-cover rounded-xl border shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gray-200" />
                        )}
                      </td>

                      {/* TITLE */}
                      <td className="py-3 px-2 font-semibold text-gray-900">
                        {ev.title}
                      </td>

                      {/* DATE */}
                      <td className="py-3 px-2 text-gray-600">
                        {formatDate(ev.date)}
                      </td>

                      {/* LOCATION */}
                      <td className="py-3 px-2 text-gray-600">{ev.location}</td>

                      {/* STATUS */}
                      <td className="py-3 px-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${
                            ev.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          {ev.status.toUpperCase()}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-2 space-x-2 whitespace-nowrap">

                        <button
                          className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition shadow-sm"
                          onClick={() => navigate(`/admin/events/${ev.id}/edit`)}
                        >
                          Edit
                        </button>

                        <button
                          className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition shadow-sm"
                          onClick={() =>
                            navigate(`/admin/events/${ev.id}/participants`)
                          }
                        >
                          Peserta
                        </button>

                        <button
                          className="px-3 py-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition shadow-sm"
                          onClick={() => deleteEvent(ev.id)}
                        >
                          Delete
                        </button>

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

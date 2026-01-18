import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getEvents, deleteEvent as deleteEventApi } from "../services/api";
import Swal from "sweetalert2";

/* =========================
   SKELETON ROW
========================= */
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b">
      <td className="py-4 px-3"><div className="w-16 h-16 bg-gray-200 rounded-xl" /></td>
      <td className="py-4 px-3"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
      <td className="py-4 px-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
      <td className="py-4 px-3"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
      <td className="py-4 px-3"><div className="h-6 w-24 bg-gray-200 rounded-lg" /></td>
      <td className="py-4 px-3"><div className="h-8 w-48 bg-gray-200 rounded-xl" /></td>
    </tr>
  );
}

/* =========================
   DATE HELPERS
========================= */
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
    setLoading(true);

    getEvents()
      .then((res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const finalEvents = (res.data || []).map((ev) => {
          const d = normalizeDate(ev.date);
          const isExpired = d ? d < today : false;

          return {
            ...ev,
            status: ev.status ?? (isExpired ? "expired" : "active"),
          };
        });

        setEvents(finalEvents);
      })
      .catch(() =>
        Swal.fire("Error", "Gagal memuat data event", "error")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const deleteEvent = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Event?",
      text: "Event yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteEventApi(id);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Event berhasil dihapus",
        timer: 1400,
        showConfirmButton: false,
      });

      fetchEvents();
    } catch {
      Swal.fire("Error", "Gagal menghapus event", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Navbar title="Manage Events" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="bg-white rounded-2xl border shadow-sm p-6">

          {/* HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
                Events
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Daftar Event
              </h2>
            </div>

            <button
              onClick={() => navigate("/admin/events/add")}
              className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700"
            >
              + Tambah Event
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="py-3 px-3 text-left">Poster</th>
                  <th className="py-3 px-3 text-left">Judul</th>
                  <th className="py-3 px-3 text-left">Tanggal</th>
                  <th className="py-3 px-3 text-left">Lokasi</th>
                  <th className="py-3 px-3 text-left">Status</th>
                  <th className="py-3 px-3 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500 italic">
                      Belum ada event
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="border-t hover:bg-gray-50">
                      {/* POSTER */}
                      <td className="py-3 px-3">
                        {ev.poster_url ? (
                          <img
                            src={ev.poster_url}
                            className="w-16 h-16 rounded-xl object-cover border shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gray-200" />
                        )}
                      </td>

                      {/* TITLE */}
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        {ev.title}
                      </td>

                      {/* DATE */}
                      <td className="py-3 px-3 text-gray-600">
                        {formatDate(ev.date)}
                      </td>

                      {/* LOCATION */}
                      <td className="py-3 px-3 text-gray-600">
                        {ev.location}
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${
                            ev.status === "active"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          {ev.status.toUpperCase()}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-3 flex gap-2 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/events/${ev.id}/edit`)}
                          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/admin/events/${ev.id}/participants`)
                          }
                          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100"
                        >
                          Peserta
                        </button>

                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Hapus
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

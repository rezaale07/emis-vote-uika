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
      <td className="py-4 px-4">
        <div className="w-14 h-14 bg-gray-200 rounded-xl" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-28 bg-gray-200 rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-36 bg-gray-200 rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </td>
      <td className="py-4 px-4">
        <div className="h-8 w-40 bg-gray-200 rounded-xl" />
      </td>
    </tr>
  );
}

/* =========================
   DATE FORMAT
========================= */
const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ManageEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH
  ========================= */
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEvents();
      setEvents(res.data || []);
    } catch {
      Swal.fire("Error", "Gagal memuat data event", "error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* =========================
     DELETE
  ========================= */
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
        timer: 1200,
        showConfirmButton: false,
      });
      fetchEvents();
    } catch {
      Swal.fire("Error", "Gagal menghapus event", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR AMAN */}
      <Navbar title="Manage Events" />

      <div className="max-w-7xl mx-auto px-4 py-6 md:grid md:grid-cols-[16rem_1fr] gap-6">
        {/* SIDEBAR — HANYA DESKTOP */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main className="bg-white rounded-2xl border shadow-sm p-5 md:p-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
              className="w-full sm:w-auto rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-blue-700 transition"
            >
              + Tambah Event
            </button>
          </div>

          {/* TABLE WRAPPER */}
          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="py-3 px-4 text-left">Poster</th>
                  <th className="py-3 px-4 text-left">Judul</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Lokasi</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Aksi</th>
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
                    <td
                      colSpan="6"
                      className="py-10 text-center text-gray-500"
                    >
                      Belum ada event
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr
                      key={ev.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      {/* POSTER */}
                      <td className="py-3 px-4">
                        {ev.poster_url ? (
                          <img
                            src={ev.poster_url}
                            alt={ev.title}
                            className="w-14 h-14 rounded-xl object-cover border shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                            No
                          </div>
                        )}
                      </td>

                      {/* TITLE */}
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {ev.title}
                      </td>

                      {/* DATE */}
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(ev.date)}
                      </td>

                      {/* LOCATION */}
                      <td className="py-3 px-4 text-gray-600">
                        {ev.location || "-"}
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            ev.status === "active"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          {ev.status.toUpperCase()}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/events/${ev.id}/edit`)
                            }
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

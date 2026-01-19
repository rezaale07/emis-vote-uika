import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getEventParticipants, getEventById } from "../services/api";
import Swal from "sweetalert2";

/* =========================
   DATE FORMATTER
========================= */
const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminEventParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      const [eventRes, partRes] = await Promise.all([
        getEventById(id),
        getEventParticipants(id),
      ]);

      // EVENT
      setEvent(eventRes.data);

      // 🔥 FINAL FIX: AMBIL PARTICIPANTS DARI BACKEND
      setParticipants(partRes.data.participants || []);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: "Terjadi kesalahan saat mengambil data peserta.",
        showCancelButton: true,
        confirmButtonText: "Coba Lagi",
        cancelButtonText: "Tutup",
        confirmButtonColor: "#2563eb",
      }).then((res) => {
        if (res.isConfirmed) loadData();
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const total = participants.length;
  const status = event?.status ?? "active";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Peserta Event" />

        <div className="px-6 py-6 max-w-6xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Kembali
          </button>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-64 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded-2xl" />
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-blue-600 font-semibold">
                  Event
                </p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {event?.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {event?.date} · {event?.location}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Total Peserta: <b>{total}</b>
                </p>
              </div>

              <span
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
                  status === "active"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </div>
          )}

          {loading ? (
            <div className="animate-pulse h-40 bg-gray-200 rounded-2xl" />
          ) : total === 0 ? (
            <div className="bg-white border border-dashed rounded-2xl py-10 text-center text-sm text-gray-500">
              Belum ada peserta yang mendaftar.
            </div>
          ) : (
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="py-3 px-5 text-left">Nama</th>
                    <th className="py-3 px-5 text-left">Email</th>
                    <th className="py-3 px-5 text-left">Tanggal Daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`border-t hover:bg-gray-50 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                      }`}
                    >
                      <td className="py-3 px-5 font-medium text-gray-900">
                        {p.user?.name}
                      </td>
                      <td className="py-3 px-5 text-gray-600">
                        {p.user?.email}
                      </td>
                      <td className="py-3 px-5 text-gray-600">
                        {formatDateTime(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="text-center text-xs text-gray-400 py-6">
          © UIKA IT Division
        </footer>
      </div>
    </div>
  );
}

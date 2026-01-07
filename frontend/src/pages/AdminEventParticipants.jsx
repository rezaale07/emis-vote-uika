import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

/* =========================
   SKELETON
========================= */
function SkeletonBox({ className }) {
  return (
    <div
      className={`animate-pulse rounded-3xl bg-slate-100 ${className}`}
    />
  );
}

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

      setEvent(eventRes.data);
      setParticipants(partRes.data?.participants || []);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: "Terjadi kesalahan saat mengambil data peserta.",
        confirmButtonColor: "#2563eb",
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
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      {/* CONTENT */}
      <div className="md:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">

          {/* HEADER */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Kembali
            </button>

            <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
              Event Participants
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
              Peserta Event
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Daftar mahasiswa yang mendaftar pada event ini.
            </p>
          </div>

          {/* EVENT INFO */}
          {loading ? (
            <SkeletonBox className="h-32" />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {event?.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {event?.date} · {event?.location || "Lokasi belum ditentukan"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Total Peserta:{" "}
                  <span className="font-semibold text-slate-700">
                    {total}
                  </span>
                </p>
              </div>

              <span
                className={`self-start sm:self-center rounded-full px-4 py-1.5 text-xs font-bold border ${
                  status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </div>
          )}

          {/* TABLE */}
          {loading ? (
            <SkeletonBox className="h-48" />
          ) : total === 0 ? (
            <div className="rounded-3xl border border-dashed bg-white py-16 text-center text-sm text-slate-500">
              Belum ada peserta yang mendaftar.
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold">
                      Nama
                    </th>
                    <th className="py-4 px-6 text-left font-semibold">
                      Email
                    </th>
                    <th className="py-4 px-6 text-left font-semibold">
                      Tanggal Daftar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`border-t transition ${
                        idx % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/60"
                      } hover:bg-slate-100`}
                    >
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {p.user?.name}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {p.user?.email}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {formatDateTime(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FOOTER */}
          <div className="text-center text-xs text-slate-400 pt-8">
            © 2025 UIKA IT Division
          </div>
        </div>
      </div>
    </div>
  );
}

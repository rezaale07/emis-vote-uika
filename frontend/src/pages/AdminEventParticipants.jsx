import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
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
    <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
  );
}

export default function AdminEventParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ev = await api.get(`/events/${id}`);
        if (!ev.data) throw new Error();
        setEvent(ev.data);

        const res = await api.get(`/events/${id}/participants`);
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.participants ?? [];

        // ADMIN: urut lama → baru
        const sorted = [...list].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        setParticipants(sorted);
      } catch (err) {
        Swal.fire("Error", "Gagal memuat peserta event", "error");
        setEvent(null);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <AdminLayout
      title="Peserta Event"
      subtitle={event?.title ? `Admin • ${event.title}` : "Admin"}
    >
      <div className="space-y-6">
        {/* TOP ACTION */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              Event Participants
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
              Daftar Peserta
            </h1>
            <p className="text-sm text-slate-600">
              Data mahasiswa yang mendaftar ke event
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            ← Kembali
          </button>
        </div>

        {/* EVENT INFO */}
        {loading ? (
          <SkeletonBox className="h-24" />
        ) : (
          <div className="rounded-2xl bg-white border p-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                {event?.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Total peserta:{" "}
                <span className="font-semibold text-slate-800">
                  {participants.length}
                </span>
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-1.5 text-xs font-bold border ${
                event?.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {String(event?.status || "unknown").toUpperCase()}
            </span>
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <SkeletonBox className="h-48" />
        ) : participants.length === 0 ? (
          <div className="rounded-2xl border bg-white py-16 text-center text-sm text-slate-500">
            Belum ada peserta yang mendaftar.
          </div>
        ) : (
          <div className="rounded-2xl bg-white border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 w-12">No</th>
                    <th className="py-3 px-4 text-left">Nama</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">
                      Tanggal Daftar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr
                      key={p.id ?? idx}
                      className="border-t hover:bg-slate-50 transition"
                    >
                      <td className="py-3 px-4 text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {p.user?.name || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.user?.email || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDateTime(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-8">
          © 2025 UIKA IT Division
        </div>
      </div>
    </AdminLayout>
  );
}

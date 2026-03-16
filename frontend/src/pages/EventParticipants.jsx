import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
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
    <div className={`animate-pulse rounded-3xl bg-slate-100 ${className}`} />
  );
}

export default function EventParticipants() {
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

        // ✅ PERBAIKAN URUTAN:
        // peserta lama di atas, peserta baru di bawah
        const sorted = [...list].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        setParticipants(sorted);
      } catch {
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
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
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

          <button
            onClick={() => navigate(-1)}
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
          >
            ← Kembali
          </button>
        </div>

        {/* EVENT INFO */}
        {loading ? (
          <SkeletonBox className="h-28" />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {event?.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Total Peserta:{" "}
                <span className="font-semibold text-slate-700">
                  {participants.length}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <SkeletonBox className="h-48" />
        ) : participants.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-white py-16 text-center text-sm text-slate-500">
            Belum ada peserta yang mendaftar.
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold w-16">
                      No
                    </th>
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
                      key={p.id ?? idx}
                      className={`border-t transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      } hover:bg-slate-100`}
                    >
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {p.user?.name || "-"}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {p.user?.email || "-"}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {formatDateTime(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center text-xs text-slate-400 pt-8">
          © 2025 UIKA IT Division
        </div>
      </div>
    </div>
  );
}

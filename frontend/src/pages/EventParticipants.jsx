import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Swal from "sweetalert2";

/* =========================
   HELPERS
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
   UI ATOMS
========================= */
function SkeletonBox({ className }) {
  return (
    <div
      className={`animate-pulse rounded-3xl bg-slate-200 ${className}`}
    />
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

        setParticipants(list);
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

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-4">
          <SkeletonBox className="h-10 w-40" />
          <SkeletonBox className="h-40 w-full" />
          <SkeletonBox className="h-56 w-full" />
        </div>
      </div>
    );
  }

  /* =========================
     NOT FOUND
  ========================= */
  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
          <p className="text-slate-500">Event tidak ditemukan.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 fade-in">
        {/* TOP BAR */}
        <div className="mb-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
          >
            ← Kembali
          </button>
        </div>

        {/* EVENT CARD */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
          {/* POSTER */}
          <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            {event.poster_url ? (
              <img
                src={event.poster_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="text-3xl">📅</div>
                <p className="mt-1 text-sm text-slate-500">
                  No Poster
                </p>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                {event.title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Daftar mahasiswa yang mendaftar pada event ini
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              👥 {participants.length} Peserta
            </span>
          </div>
        </div>

        {/* PARTICIPANTS */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-slate-800">
              Daftar Peserta Event
            </h2>
          </div>

          {participants.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Belum ada peserta yang mendaftar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-3 px-6 text-left font-semibold">
                      Nama
                    </th>
                    <th className="py-3 px-6 text-left font-semibold">
                      Email
                    </th>
                    <th className="py-3 px-6 text-left font-semibold">
                      Tanggal Daftar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`border-t transition hover:bg-slate-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      <td className="py-3 px-6 font-medium text-slate-900">
                        {p.user?.name ?? "-"}
                      </td>
                      <td className="py-3 px-6 text-slate-600">
                        {p.user?.email ?? "-"}
                      </td>
                      <td className="py-3 px-6 text-slate-600">
                        {formatDateTime(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn .25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

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
     UI STATES
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="max-w-5xl mx-auto p-6 animate-pulse space-y-4">
          <div className="h-8 w-40 bg-slate-200 rounded-xl" />
          <div className="h-40 bg-slate-200 rounded-3xl" />
          <div className="h-52 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="text-center py-20 text-slate-500">
          Event tidak ditemukan.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <div className="max-w-5xl mx-auto p-6 fade-in">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm hover:bg-slate-100 transition"
        >
          ← Kembali
        </button>

        {/* EVENT HEADER */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-6">
          <img
            src={
              event.poster_url ??
              "https://source.unsplash.com/1200x300/?event,seminar"
            }
            className="w-full h-40 object-cover"
            alt={event.title}
          />

          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                {event.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Daftar peserta yang telah mendaftar event ini
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
              👥 Total Peserta: {participants.length}
            </div>
          </div>
        </div>

        {/* PARTICIPANTS TABLE */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-slate-800">
              Daftar Peserta Event
            </h2>
          </div>

          {participants.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-500">
              Belum ada peserta yang mendaftar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
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
                      className={`border-t transition hover:bg-slate-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      <td className="py-3 px-5 font-medium text-slate-900">
                        {p.user?.name ?? "-"}
                      </td>
                      <td className="py-3 px-5 text-slate-600">
                        {p.user?.email ?? "-"}
                      </td>
                      <td className="py-3 px-5 text-slate-600">
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

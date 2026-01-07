import { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const userId = user?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  /* =========================
     HELPERS
  ========================= */
  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";

  const formatTime = (t) => (t ? `${t} WIB` : "-");

  const getEventDateTime = (ev) => {
    if (!ev?.date) return null;
    const date = ev.date.slice(0, 10);
    const time = ev.time ? ev.time.slice(0, 5) : "23:59";
    const dt = new Date(`${date}T${time}:00`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  const isExpired = useMemo(() => {
    const dt = getEventDateTime(event);
    return dt ? dt.getTime() < Date.now() : false;
  }, [event]);

  const statusText = isExpired
    ? "EXPIRED"
    : event?.status?.toUpperCase() || "ACTIVE";

  const badgeClass = isExpired
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-emerald-50 border-emerald-200 text-emerald-700";

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      try {
        const ev = await api.get(`/events/${id}`);
        setEvent(ev.data);

        const check = await api.get("/registrations/check", {
          params: { event_id: Number(id), user_id: Number(userId) },
        });

        setIsRegistered(Boolean(check.data?.registered));
      } catch {
        Swal.fire("Error", "Event tidak ditemukan", "error");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, userId]);

  /* =========================
     REGISTER
  ========================= */
  const registerNow = async () => {
    if (isExpired)
      return Swal.fire(
        "Pendaftaran Ditutup",
        "Event ini sudah berakhir.",
        "warning"
      );

    const confirm = await Swal.fire({
      title: "Daftar Event?",
      text: "Pastikan kamu ingin mengikuti event ini.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Daftar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
    });

    if (!confirm.isConfirmed) return;

    setSending(true);
    try {
      await api.post("/registrations", {
        event_id: Number(id),
        user_id: Number(userId),
      });
      setIsRegistered(true);
      Swal.fire("Berhasil!", "Kamu berhasil mendaftar.", "success");
    } catch {
      Swal.fire("Gagal", "Kamu sudah terdaftar.", "error");
    } finally {
      setSending(false);
    }
  };

  /* =========================
     UI STATES
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="max-w-5xl mx-auto p-6 animate-pulse space-y-4">
          <div className="h-8 w-40 bg-slate-200 rounded-xl" />
          <div className="h-72 bg-slate-200 rounded-3xl" />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-20 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <p className="text-center py-20 text-slate-500">
          Event tidak ditemukan.
        </p>
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
          className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm hover:bg-slate-100"
        >
          ← Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          {/* POSTER */}
          <div className="relative">
            <img
              src={
                event.poster_url ??
                "https://source.unsplash.com/1200x400/?seminar,event"
              }
              className="w-full h-72 object-cover"
              alt={event.title}
            />
            <span
              className={`absolute top-5 right-5 px-3 py-1.5 text-xs font-semibold rounded-full border ${badgeClass}`}
            >
              {statusText}
            </span>
          </div>

          <div className="p-6">
            {/* HEADER */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {event.title}
            </h1>

            {event.description && (
              <p className="mt-2 text-slate-600 leading-relaxed">
                {event.description}
              </p>
            )}

            {/* INFO */}
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <InfoCard label="Tanggal" value={formatDate(event.date)} />
              <InfoCard label="Waktu" value={formatTime(event.time)} />
              <InfoCard label="Lokasi" value={event.location || "-"} />
            </div>

            {/* ACTION */}
            {isRegistered ? (
              <button className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold">
                ✓ Kamu Sudah Terdaftar
              </button>
            ) : (
              <button
                onClick={registerNow}
                disabled={sending || isExpired}
                className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
                  isExpired
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isExpired
                  ? "Pendaftaran Ditutup"
                  : sending
                  ? "Memproses..."
                  : "Daftar Sekarang"}
              </button>
            )}

            <button
              onClick={() => navigate(`/event/${id}/participants`)}
              className="w-full mt-3 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl border"
            >
              Lihat Peserta Event
            </button>

            {isExpired && !isRegistered && (
              <p className="mt-3 text-xs text-red-600">
                * Event telah berakhir, pendaftaran otomatis ditutup.
              </p>
            )}
          </div>
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

function InfoCard({ label, value }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

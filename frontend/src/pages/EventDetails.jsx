import { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

/* =========================
   UI ATOMS
========================= */
function SkeletonBox({ className }) {
  return <div className={`animate-pulse rounded-3xl bg-slate-200 ${className}`} />;
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

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

  const formatTime = (t) => (t ? `${String(t).slice(0, 5)} WIB` : "-");

  const getEventDateTime = (ev) => {
    if (!ev?.date) return null;
    const date = String(ev.date).slice(0, 10);
    const time = ev.time ? String(ev.time).slice(0, 5) : "23:59";
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
    ? "bg-rose-50 border-rose-200 text-rose-700"
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
    if (isExpired) {
      return Swal.fire("Pendaftaran Ditutup", "Event ini sudah berakhir.", "warning");
    }

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
      Swal.fire("Gagal", "Kamu sudah terdaftar atau terjadi kesalahan.", "error");
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
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 space-y-4">
          <SkeletonBox className="h-10 w-44" />
          <SkeletonBox className="h-72 w-full" />
          <div className="grid sm:grid-cols-3 gap-4">
            <SkeletonBox className="h-20" />
            <SkeletonBox className="h-20" />
            <SkeletonBox className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 text-center">
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

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 fade-in">
        {/* TOP BAR */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
          >
            ← Kembali
          </button>

          <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${badgeClass}`}>
            {statusText}
          </span>
        </div>

        {/* CARD */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* POSTER */}
          <div className="relative">
            {event.poster_url ? (
              <img
                src={event.poster_url}
                className="w-full h-72 object-cover"
                alt={event.title}
                loading="lazy"
              />
            ) : (
              <div className="h-72 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl">📅</div>
                  <p className="mt-2 text-sm text-slate-500">No Poster</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* HEADER */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {event.title}
            </h1>

            {event.description ? (
              <p className="mt-2 text-slate-600 leading-relaxed">{event.description}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500 italic">
                Tidak ada deskripsi.
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
              <button
                type="button"
                className="w-full mt-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-sm"
              >
                ✓ Kamu Sudah Terdaftar
              </button>
            ) : (
              <button
                type="button"
                onClick={registerNow}
                disabled={sending || isExpired}
                className={[
                  "w-full mt-6 py-3 rounded-2xl font-bold shadow-sm transition",
                  isExpired
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700",
                ].join(" ")}
              >
                {isExpired ? "Pendaftaran Ditutup" : sending ? "Memproses..." : "Daftar Sekarang"}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/event/${id}/participants`)}
              className="w-full mt-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 transition"
            >
              Lihat Peserta Event
            </button>

            {isExpired && !isRegistered && (
              <p className="mt-3 text-xs text-rose-600">
                * Event telah berakhir, pendaftaran otomatis ditutup.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

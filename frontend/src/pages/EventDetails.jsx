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

  // ==========================
  // HELPERS
  // ==========================
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (t) => {
    if (!t) return "-";
    // "HH:mm" -> tampil "HH:mm WIB"
    return `${t} WIB`;
  };

  // Build Date object dari event.date + event.time
  // Jika time kosong: anggap jam 23:59 (biar event masih berlaku sampai akhir hari)
  const getEventDateTime = (ev) => {
    if (!ev?.date) return null;

    const dateStr = String(ev.date).slice(0, 10); // aman: "YYYY-MM-DD"
    const timeStr = ev?.time ? String(ev.time).slice(0, 5) : "23:59"; // "HH:mm"

    // IMPORTANT: pakai format ISO-ish supaya konsisten
    const dt = new Date(`${dateStr}T${timeStr}:00`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  // EXPIRED realtime (frontend truth)
  const isExpired = useMemo(() => {
    const dt = getEventDateTime(event);
    if (!dt) return false; // kalau date invalid, jangan blok
    return dt.getTime() < Date.now();
  }, [event]);

  // Status untuk badge (override backend)
  const statusText = isExpired ? "EXPIRED" : (event?.status?.toUpperCase() || "ACTIVE");

  const badgeClass = isExpired
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-emerald-50 border-emerald-200 text-emerald-700";

  // ==========================
  // LOAD
  // ==========================
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      try {
        const ev = await api.get(`/events/${id}`);
        if (!ev.data) {
          Swal.fire({
            icon: "error",
            title: "Event Tidak Ditemukan",
            text: "Event ini tidak tersedia.",
          });
          setEvent(null);
          return;
        }

        setEvent(ev.data);

        // Check registration
        const check = await api.get("/registrations/check", {
          params: { event_id: Number(id), user_id: Number(userId) },
        });

        setIsRegistered(Boolean(check.data?.registered));
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Event",
          text: "Terjadi kesalahan saat mengambil data event.",
        });
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, userId]);

  // ==========================
  // REGISTER
  // ==========================
  const registerNow = async () => {
    if (isExpired) {
      return Swal.fire({
        icon: "warning",
        title: "Pendaftaran Ditutup",
        text: "Event ini sudah berakhir / expired, jadi tidak bisa daftar lagi.",
        confirmButtonColor: "#dc2626",
      });
    }

    if (isRegistered) {
      return Swal.fire("Info", "Kamu sudah terdaftar.", "info");
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "Daftar ke Event?",
      text: "Pastikan kamu ingin mengikuti event ini.",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Daftar",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setSending(true);

    try {
      await api.post("/registrations", {
        event_id: Number(id),
        user_id: Number(userId),
      });

      setIsRegistered(true);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kamu berhasil mendaftar event.",
        confirmButtonColor: "#16a34a",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Mendaftar",
        text: err?.response?.data?.message || "Kamu sudah terdaftar atau terjadi kesalahan.",
      });
    } finally {
      setSending(false);
    }
  };

  // ==========================
  // UI STATES
  // ==========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="max-w-5xl mx-auto p-6 animate-pulse space-y-4">
          <div className="h-10 w-40 bg-gray-200 rounded-xl" />
          <div className="h-72 bg-gray-200 rounded-2xl" />
          <div className="h-6 w-2/3 bg-gray-200 rounded" />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="max-w-5xl mx-auto p-6 text-center text-gray-500">
          Event tidak ditemukan.
        </div>
      </div>
    );
  }

  const canRegister = !isRegistered && !sending && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="max-w-5xl mx-auto p-6 fade-in">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm hover:bg-gray-100 transition"
        >
          ← Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border">
          {/* POSTER */}
          <div className="relative">
            <img
              src={
                event.poster_url ??
                "https://source.unsplash.com/1200x400/?event,seminar"
              }
              className="w-full h-72 object-cover"
              alt={event.title}
            />

            {/* badge floating */}
            <div className="absolute right-5 top-5">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${badgeClass}`}
              >
                {statusText}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            {/* INFO GRID */}
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <InfoCard label="Tanggal" value={formatDate(event.date)} />
              <InfoCard label="Waktu" value={event.time ? formatTime(event.time) : "-"} />
              <InfoCard label="Lokasi" value={event.location || "-"} />
            </div>

            {/* ACTIONS */}
            {isRegistered ? (
              <button
                className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow hover:bg-emerald-700"
                type="button"
              >
                ✓ Kamu Sudah Terdaftar
              </button>
            ) : (
              <button
                onClick={registerNow}
                disabled={!canRegister}
                className={[
                  "w-full mt-6 py-3 rounded-xl font-semibold shadow transition",
                  canRegister
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                ].join(" ")}
                type="button"
              >
                {isExpired ? "Pendaftaran Ditutup" : sending ? "Memproses..." : "Daftar Sekarang"}
              </button>
            )}

            <button
              onClick={() => navigate(`/event/${id}/participants`)}
              className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-sm border transition"
              type="button"
            >
              Lihat Peserta Event
            </button>

            {isExpired && !isRegistered && (
              <p className="mt-3 text-xs text-red-600">
                * Event sudah lewat, pendaftaran otomatis ditutup.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl shadow-sm border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

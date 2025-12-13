import { useEffect, useState, useContext } from "react";
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

  // Format tanggal
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
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
        setIsRegistered(check.data.registered);
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

  const registerNow = async () => {
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
        text: "Kamu sudah terdaftar atau terjadi kesalahan.",
      });
    }

    setSending(false);
  };

  // ==========================
  // LOADING SKELETON
  // ==========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-300 rounded"></div>
          <div className="h-64 bg-gray-300 rounded-xl"></div>
          <div className="h-5 w-full bg-gray-200 rounded"></div>
          <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // ==========================
  // EVENT NOT FOUND
  // ==========================
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="max-w-4xl mx-auto p-6 text-center text-gray-500">
          Event tidak ditemukan.
        </div>
      </div>
    );
  }

  // ==========================
  // MAIN CONTENT
  // ==========================
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto p-6 fade-in">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-white border rounded-xl shadow-sm hover:bg-gray-100 transition"
        >
          ← Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">

          {/* POSTER */}
          <img
            src={
              event.poster_url ??
              "https://source.unsplash.com/1200x400/?event,seminar"
            }
            className="w-full h-64 object-cover"
          />

          <div className="p-6">

            {/* HEADER */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {event.title}
                </h1>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
                  event.status === "active"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {event.status?.toUpperCase() || "ACTIVE"}
              </span>
            </div>

            {/* INFO GRID */}
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <InfoCard label="Tanggal" value={formatDate(event.date)} />
              <InfoCard label="Waktu" value={event.time || "08:00 WIB"} />
              <InfoCard label="Lokasi" value={event.location} />
            </div>

            {/* ACTION BUTTONS */}
            {isRegistered ? (
              <button className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow hover:bg-green-700">
                ✓ Kamu Sudah Terdaftar
              </button>
            ) : (
              <button
                onClick={registerNow}
                disabled={sending}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 disabled:bg-blue-300"
              >
                {sending ? "Memproses..." : "Daftar Sekarang"}
              </button>
            )}

            <button
              onClick={() => navigate(`/event/${id}/participants`)}
              className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl shadow border"
            >
              Lihat Peserta Event
            </button>

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
    <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

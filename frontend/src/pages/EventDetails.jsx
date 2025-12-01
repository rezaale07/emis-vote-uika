import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import { AuthContext } from "../context/AuthContext";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const userId = user?.id; // FIXED → ambil ID dari AuthContext

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);

        const check = await api.get("/registrations/check", {
          params: {
            event_id: Number(id),
            user_id: Number(userId),
          },
        });

        setIsRegistered(check.data.registered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, userId]);

  const registerNow = async () => {
    setSending(true);

    try {
      await api.post("/registrations", {
        event_id: Number(id),
        user_id: Number(userId),
      });

      alert("Berhasil mendaftar event!");
      setIsRegistered(true);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Anda sudah terdaftar atau terjadi kesalahan.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto p-6">

        <button onClick={() => navigate(-1)} className="mb-4 bg-white px-4 py-2 rounded shadow">
          ← Kembali
        </button>

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <img
  src={event.poster_url ?? "https://source.unsplash.com/1200x400/?seminar,event"}
  className="w-full h-64 object-cover"
/>

          <div className="p-6">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-gray-600 mt-2">{event.description}</p>

            <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
              <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                <b>Tanggal</b>
                <p>{event.date}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                <b>Waktu</b>
                <p>{event.time || "08:00 WIB"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                <b>Lokasi</b>
                <p>{event.location}</p>
              </div>
            </div>

            {isRegistered ? (
              <button disabled className="w-full mt-6 bg-green-500 text-white py-3 rounded-xl">
                ✓ Kamu Sudah Terdaftar
              </button>
            ) : (
              <button
                onClick={registerNow}
                disabled={sending}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
              >
                {sending ? "Memproses..." : "Daftar Sekarang"}
              </button>
            )}

            <button
              onClick={() => navigate(`/event/${id}/participants`)}
              className="w-full mt-3 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl"
            >
              Lihat Peserta Event
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";

export default function EventParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch event + participants
  useEffect(() => {
    const loadData = async () => {
      try {
        const ev = await api.get(`/events/${id}`);
        setEvent(ev.data);

        const res = await api.get(`/events/${id}/participants`);
        setParticipants(res.data);

      } catch (err) {
        console.error(err);
        alert("Gagal memuat data peserta.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-gray-600">Memuat daftar peserta...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto p-6">

        {/* TOMBOL KEMBALI */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 bg-white shadow px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          ← Kembali
        </button>

        {/* HEADER EVENT */}
        <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
          <img
            src={event.poster_url || "https://source.unsplash.com/1200x300/?event"}
            className="w-full h-40 object-cover"
          />

          <div className="p-5">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-500 mt-1">
              Total Peserta: <b>{participants.length}</b>
            </p>
          </div>
        </div>

        {/* TABLE PESERTA */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Daftar Peserta</h2>

          {participants.length === 0 ? (
            <p className="text-gray-500">Belum ada peserta.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-2 text-left px-2">Nama</th>
                    <th className="py-2 text-left px-2">Email</th>
                    <th className="py-2 text-left px-2">Tanggal Daftar</th>
                  </tr>
                </thead>

                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{p.name}</td>
                      <td className="py-2 px-2">{p.email}</td>
                      <td className="py-2 px-2">
                        {new Date(p.created_at).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

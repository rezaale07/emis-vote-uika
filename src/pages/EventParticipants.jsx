import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Swal from "sweetalert2";

export default function EventParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ev = await api.get(`/events/${id}`);
        if (!ev.data) {
          Swal.fire("Error", "Event tidak ditemukan", "error");
          return;
        }
        setEvent(ev.data);

        const res = await api.get(`/events/${id}/participants`);

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.participants ?? [];

        setParticipants(list);
      } catch (err) {
        Swal.fire("Error", "Gagal memuat peserta", "error");
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="p-6 text-center text-gray-500">Memuat...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="p-6 text-center text-gray-500">
          Event tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-white border rounded-lg shadow hover:bg-gray-100"
        >
          ← Kembali
        </button>

        <div className="bg-white rounded-xl shadow border mb-6 overflow-hidden">
          <img
            src={event.poster_url || "https://source.unsplash.com/1200x300/?event"}
            className="w-full h-40 object-cover"
            alt={event.title}
          />
          <div className="p-4">
            <h1 className="text-xl font-bold">{event.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total Peserta: <b>{participants.length}</b>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border p-4">
          <h2 className="font-semibold mb-3">Daftar Peserta</h2>

          {participants.length === 0 ? (
            <p className="text-gray-500">Belum ada peserta.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="text-left p-2">Nama</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{p.user?.name ?? "-"}</td>
                    <td className="p-2">{p.user?.email ?? "-"}</td>
                    <td className="p-2">
                      {new Date(p.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

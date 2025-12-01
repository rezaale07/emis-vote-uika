import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getEventParticipants, getEventById } from "../services/api";

export default function AdminEventParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEventById(id),
      getEventParticipants(id),
    ])
      .then(([eventRes, partRes]) => {
        setEvent(eventRes.data);
        setParticipants(partRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Daftar Peserta Event" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="rounded-2xl border bg-white p-6 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ← Kembali
          </button>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800">
                Peserta Event: {event?.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Total Peserta: {participants.length}
              </p>

              {participants.length === 0 ? (
                <p className="text-gray-600">Belum ada peserta.</p>
              ) : (
                <table className="w-full mt-4 text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-2">Nama</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Tanggal Daftar</th>
                    </tr>
                  </thead>

                  <tbody>
                    {participants.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="py-2">{p.name}</td>
                        <td className="py-2">{p.email}</td>
                        <td className="py-2">
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

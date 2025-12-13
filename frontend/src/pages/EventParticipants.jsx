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

  // Load Event + Participants
  useEffect(() => {
    const load = async () => {
      try {
        const ev = await api.get(`/events/${id}`);

        if (!ev.data) {
          Swal.fire({
            icon: "error",
            title: "Event Tidak Ditemukan",
            text: "Data event tidak tersedia.",
          });
          setEvent(null);
          return;
        }

        setEvent(ev.data);

        const part = await api.get(`/events/${id}/participants`);
        setParticipants(part.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: "Terjadi kesalahan dalam memuat event atau peserta.",
          confirmButtonColor: "#dc2626",
        });
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ======================
  // LOADING SKELETON
  // ======================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />

        <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-4">
          <div className="h-6 w-40 bg-gray-300 rounded"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // ======================
  // EVENT NOT FOUND
  // ======================
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="max-w-4xl mx-auto p-6 text-center text-gray-600">
          Event tidak ditemukan.
        </div>
      </div>
    );
  }

  // ======================
  // MAIN CONTENT
  // ======================
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto p-6 fade-in">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 px-4 py-2 rounded-xl border bg-white shadow-sm hover:bg-gray-100 transition"
        >
          ← Kembali
        </button>

        {/* Event Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border mb-6">
          <img
            src={
              event.poster_url ||
              "https://source.unsplash.com/1200x300/?event,seminar"
            }
            className="w-full h-40 object-cover"
          />

          <div className="p-5">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>

            <p className="text-gray-600 text-sm mt-1">
              Total Peserta Terdaftar:{" "}
              <span className="font-semibold text-gray-900">
                {participants.length}
              </span>
            </p>
          </div>
        </div>

        {/* Participants List */}
        <div className="bg-white rounded-2xl shadow border p-5">
          <h2 className="text-lg font-semibold mb-4">Daftar Peserta</h2>

          {participants.length === 0 ? (
            <p className="text-gray-500">Belum ada peserta yang mendaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-600 bg-gray-50">
                    <th className="py-3 px-3 text-left">Nama</th>
                    <th className="py-3 px-3 text-left">Email</th>
                    <th className="py-3 px-3 text-left">Tanggal Daftar</th>
                  </tr>
                </thead>

                <tbody>
                  {participants.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-2.5 px-3">{p.name}</td>
                      <td className="py-2.5 px-3">{p.email}</td>
                      <td className="py-2.5 px-3">
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

      <style>{`
        .fade-in {
          animation: fadeIn .25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

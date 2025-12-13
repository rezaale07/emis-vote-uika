import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getEventParticipants, getEventById } from "../services/api";
import Swal from "sweetalert2";

export default function AdminEventParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      const [eventRes, partRes] = await Promise.all([
        getEventById(id),
        getEventParticipants(id),
      ]);

      setEvent(eventRes.data);
      setParticipants(partRes.data);
    } catch (err) {
      console.error(err);

      // =====================================
      // SWEETALERT ERROR POPUP + RETRY
      // =====================================
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data Peserta",
        text: "Terjadi kesalahan saat mengambil data event.",
        showCancelButton: true,
        confirmButtonText: "Coba Lagi",
        cancelButtonText: "Tutup",
        confirmButtonColor: "#2563eb",
      }).then((res) => {
        if (res.isConfirmed) loadData();
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const total = participants.length;

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Daftar Peserta Event" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-5xl mx-auto">

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm transition"
          >
            ← Kembali
          </button>

          {/* CONTENT */}
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-40 bg-gray-200 rounded-xl"></div>
            </div>
          ) : (
            <>
              {/* EVENT INFO CARD */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {event?.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {event?.date} · {event?.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total Peserta: <b>{total}</b>
                  </p>
                </div>

                <span
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                    (event?.status ?? "active") === "active"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {(event?.status ?? "active").toUpperCase()}
                </span>
              </div>

              {/* TABLE */}
              {total === 0 ? (
                <p className="text-gray-600">Belum ada peserta.</p>
              ) : (
                <div className="overflow-x-auto bg-white rounded-2xl border shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-600 bg-gray-50">
                        <th className="py-3 px-4">Nama</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Tanggal Daftar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b last:border-0 hover:bg-gray-50 transition"
                        >
                          <td className="py-2.5 px-4">{p.name}</td>
                          <td className="py-2.5 px-4">{p.email}</td>
                          <td className="py-2.5 px-4">
                            {new Date(p.created_at).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = () => {
    api.get("/events")
      .then((res) => setEvents(res.data))
      .catch(() => alert("Gagal mengambil event"))
      .finally(() => setLoading(false));
  };

  const deleteEvent = async (id) => {
    if (!confirm("Yakin ingin menghapus event ini?")) return;

    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch {
      alert("Gagal menghapus event.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Manage Events" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Daftar Event</h2>

            <button
              className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-500 transition"
              onClick={() => navigate("/admin/events/add")}
            >
              + Add Event
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 px-2">Poster</th>
                  <th className="py-3 px-2">Title</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Location</th>
                  <th className="py-3 px-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">Loading...</td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">Belum ada event.</td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="border-b hover:bg-gray-50 transition">

                      <td className="py-3 px-2">
                        {ev.poster_url ? (
                          <img src={ev.poster_url} className="w-16 h-16 object-cover rounded-lg shadow" />
                        ) : "-"}
                      </td>

                      <td className="py-3 px-2">{ev.title}</td>
                      <td className="py-3 px-2">{ev.date}</td>
                      <td className="py-3 px-2">{ev.location}</td>

                      <td className="py-3 px-2 space-x-2">
                        <button
                          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                          onClick={() => navigate(`/admin/events/${ev.id}/participants`)}
                        >
                          Peserta
                        </button>

                        <button
                          className="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                          onClick={() => deleteEvent(ev.id)}
                        >
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}

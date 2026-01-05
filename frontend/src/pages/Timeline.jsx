// src/pages/Timeline.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";

/* ======================== UTIL ======================== */
const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const isExpired = (date, time) => {
  if (!date) return false;
  const t = time ? time.slice(0, 5) : "23:59";
  const dt = new Date(`${date}T${t}:00`);
  return dt.getTime() < Date.now();
};

export default function Timeline() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================== LOAD DATA ======================== */
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const res = await api.get(`/users/${user.id}/history`);
        const list = Array.isArray(res.data?.history)
          ? res.data.history
          : [];
        setItems(list);
      } catch (err) {
        console.error("Timeline error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Timeline
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Riwayat event yang pernah kamu ikuti.
        </p>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-2xl border animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!loading && items.length === 0 && (
          <div className="bg-white border rounded-2xl p-6 text-center text-sm text-gray-500">
            Belum ada riwayat event.
          </div>
        )}

        {/* ================= LIST ================= */}
        {!loading && items.length > 0 && (
          <ul className="space-y-4">
            {items.map((item) => {
              const ev = item.event;
              const expired = isExpired(ev?.date, ev?.time);

              return (
                <li
                  key={item.id}
                  onClick={() => navigate(`/event/${ev.id}`)}
                  className="group cursor-pointer bg-white border rounded-2xl p-4
                             hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="flex gap-4">
                    {/* POSTER */}
                    <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {ev?.poster_url ? (
                        <img
                          src={ev.poster_url}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No Poster
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ev?.title}
                        </h3>

                        <span
                          className={`text-[11px] px-3 py-1 rounded-full font-semibold shrink-0 ${
                            expired
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {expired ? "EXPIRED" : "ACTIVE"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(ev?.date)} • {ev?.location || "-"}
                      </p>

                      <div className="mt-2 text-xs font-medium text-blue-600">
                        Lihat detail →
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

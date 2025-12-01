import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { deleteVoting } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ManageVoting() {
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadVoting = () => {
    setLoading(true);
    api
      .get("/votings")
      .then((res) => setVotings(res.data))
      .catch((err) => console.error("Gagal load voting:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVoting();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus voting ini?")) return;

    try {
      await deleteVoting(id);
      alert("Voting berhasil dihapus!");
      loadVoting();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus voting!");
    }
  };

  const statusBadge = (status) => {
    const base =
      "px-3 py-1 text-xs rounded-full font-medium tracking-wide border shadow-sm";

    if (status === "active")
      return base + " bg-green-50 text-green-700 border-green-300";

    if (status === "closed")
      return base + " bg-red-50 text-red-600 border-red-300";

    return base + " bg-gray-100 text-gray-700 border-gray-300"; // draft
  };

  const getPosterUrl = (filename) => {
    if (!filename) return "/no-image.png";

    const base = api.defaults.baseURL || "";
    const root = base.replace(/\/api\/?$/, "");

    return `${root}/storage/voting_posters/${filename}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Manage Voting" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN CONTENT */}
        <main className="rounded-2xl border bg-white p-6 shadow transition">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Voting Sessions
            </h2>

            <button
              onClick={() => navigate("/admin/voting/add")}
              className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition shadow"
            >
              + Create Voting
            </button>
          </div>

          {/* LOADING SKELETON */}
          {loading ? (
            <div className="mt-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-5 flex items-center gap-5 bg-white animate-pulse shadow-sm"
                >
                  <div className="w-28 h-28 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : votings.length === 0 ? (
            <p className="mt-6 text-gray-500 text-center">
              Belum ada voting dibuat.
            </p>
          ) : (
            <ul className="mt-4 space-y-5">
              {votings.map((v) => (
                <li
                  key={v.id}
                  className="rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between bg-white shadow hover:shadow-md transition-all duration-200 gap-4"
                >
                  {/* POSTER + INFO */}
                  <div className="flex items-center gap-4">
                    <img
                      src={getPosterUrl(v.poster)}
                      alt="poster"
                      className="w-28 h-28 object-cover rounded-xl border shadow-sm bg-gray-50"
                    />

                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-lg text-gray-800">
                        {v.title}
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <span className={statusBadge(v.status)}>
                          {v.status.toUpperCase()}
                        </span>

                        {typeof v.votes_count !== "undefined" && (
                          <span className="text-xs text-gray-500">
                            {v.votes_count} Votes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() =>
                        navigate(`/admin/voting/${v.id}/candidates`)
                      }
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 transition shadow-sm"
                    >
                      Manage Candidates
                    </button>

                    <button
                      onClick={() => navigate(`/admin/voting/${v.id}/edit`)}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 transition shadow-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => navigate(`/admin/results?v=${v.id}`)}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 transition shadow-sm"
                    >
                      Results
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      className="rounded-xl border border-red-400 text-red-600 px-4 py-2 text-sm hover:bg-red-50 transition shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

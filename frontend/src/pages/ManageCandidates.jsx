import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function ManageCandidates() {
  const { id } = useParams(); // votingId
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);

    Promise.all([
      api.get(`/votings/${id}`),
      api.get(`/votings/${id}/options`)
    ])
      .then(([votingRes, candidateRes]) => {
        setVoting(votingRes.data);
        setCandidates(candidateRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async (cid) => {
    if (!confirm("Hapus kandidat ini?")) return;

    try {
      await api.delete(`/votings/${id}/options/${cid}`);
      alert("Kandidat berhasil dihapus.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus kandidat.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Manage Candidates" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="rounded-2xl border bg-white p-6 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 rounded-lg border px-3 py-1 hover:bg-gray-100"
          >
            ← Back
          </button>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 w-1/3 rounded"></div>
              <div className="h-4 bg-gray-100 w-1/2 rounded"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">{voting?.title}</h2>
              <p className="text-gray-500 mb-6">{voting?.description}</p>

              <button
                onClick={() => navigate(`/admin/voting/${id}/candidates/add`)}
                className="mb-4 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700 transition"
              >
                + Add Candidate
              </button>

              {candidates.length === 0 ? (
                <p className="text-gray-500">Belum ada kandidat.</p>
              ) : (
                <div className="space-y-4">
                  {candidates.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            c.photo_url ||
                            "https://source.unsplash.com/80x80/?person"
                          }
                          alt={c.name}
                          className="w-16 h-16 rounded-full object-cover border shadow-sm"
                        />

                        <div>
                          <div className="font-semibold text-gray-800">
                            {c.name}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {c.bio || "Tanpa deskripsi"}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/voting/${id}/candidates/${c.id}/edit`
                            )
                          }
                          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          className="rounded-xl border border-red-400 text-red-600 px-3 py-2 text-sm hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

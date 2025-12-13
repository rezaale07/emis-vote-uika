import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Swal from "sweetalert2";

// Skeleton loading
function CandidateSkeleton() {
  return (
    <div className="p-4 border rounded-2xl flex items-center justify-between bg-white shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-48" />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded-xl" />
        <div className="w-16 h-8 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function ManageCandidates() {
  const { id } = useParams();
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
        setCandidates(Array.isArray(candidateRes.data) ? candidateRes.data : []);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: "Terjadi kesalahan saat memuat kandidat.",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async (cid) => {
    const confirm = await Swal.fire({
      title: "Hapus Kandidat?",
      text: "Kandidat yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/votings/${id}/options/${cid}`);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Kandidat berhasil dihapus!",
        timer: 1500,
        showConfirmButton: false,
      });

      loadData();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: "Terjadi kesalahan saat menghapus kandidat.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Manage Candidates" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">

        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main className="rounded-2xl border bg-white p-6 shadow-sm fade-in">

          {/* Header Top */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
            >
              ← Back
            </button>

            <button
              onClick={() => navigate(`/admin/voting/${id}/candidates/add`)}
              className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-blue-700 transition"
            >
              + Add Candidate
            </button>
          </div>

          {/* Voting Info */}
          {loading ? (
            <div className="animate-pulse mb-6 space-y-3">
              <div className="h-6 bg-gray-200 w-1/3 rounded" />
              <div className="h-4 bg-gray-100 w-1/2 rounded" />
              <div className="h-5 bg-gray-100 w-24 rounded" />
            </div>
          ) : (
            voting && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {voting.title}
                </h2>

                {voting.description && (
                  <p className="text-gray-600 text-sm mt-1 max-w-2xl">
                    {voting.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs">

                  <span
                    className={`px-3 py-1.5 rounded-full font-semibold border shadow-sm
                      ${
                        voting.status === "active"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }
                    `}
                  >
                    {voting.status?.toUpperCase() || "DRAFT"}
                  </span>

                  <span className="text-gray-500">
                    {candidates.length} kandidat
                  </span>
                </div>
              </div>
            )
          )}

          {/* Candidate List */}
          {loading ? (
            <div className="space-y-3">
              <CandidateSkeleton />
              <CandidateSkeleton />
              <CandidateSkeleton />
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-12 text-center text-gray-500 italic border rounded-2xl bg-gray-50 shadow-sm">
              Belum ada kandidat. Tambahkan kandidat untuk voting ini.
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border rounded-2xl flex items-center justify-between hover:bg-gray-50 transition shadow-sm"
                >
                  {/* Left: Photo + info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        c.photo_url ||
                        "https://source.unsplash.com/80x80/?person,face"
                      }
                      alt={c.name}
                      className="w-16 h-16 rounded-full object-cover border shadow-sm bg-gray-100"
                    />

                    <div>
                      <div className="font-semibold text-gray-900">{c.name}</div>

                      <div className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {c.bio || "Tanpa deskripsi"}
                      </div>

                      {typeof c.votes_count !== "undefined" && (
                        <div className="mt-2 text-xs text-gray-500">
                          {c.votes_count} votes
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/voting/${id}/candidates/${c.id}/edit`)
                      }
                      className="rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-xl border border-red-400 text-red-600 px-3 py-2 text-sm shadow-sm hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Animation */}
      <style>{`
        .fade-in {
          animation: fadeIn .25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

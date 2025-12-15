import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Swal from "sweetalert2";

export default function AddEventVote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire("Validasi", "Nama event wajib diisi", "warning");
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("bio", description);
    if (file) fd.append("photo", file);

    try {
      await api.post(`/votings/${id}/options`, fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Event voting berhasil ditambahkan",
        timer: 1300,
        showConfirmButton: false,
      });

      navigate(`/admin/voting/${id}/event-vote`);
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Navbar title="Tambah Event Voting" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main className="rounded-2xl border bg-white p-6 shadow-sm max-w-3xl">
          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-xl border px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            ← Kembali
          </button>

          {/* HEADER */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
              Event Voting
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Tambah Event Baru
            </h2>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Event
              </label>
              <input
                className="w-full border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Contoh: Seminar AI Nasional"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Event
              </label>
              <textarea
                className="w-full border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none min-h-[120px]"
                placeholder="Deskripsi singkat mengenai event"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* PREVIEW */}
            {preview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Poster
                </label>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 rounded-xl object-cover border shadow-sm"
                />
              </div>
            )}

            {/* FILE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poster Event
              </label>
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setFile(f);
                  setPreview(URL.createObjectURL(f));
                }}
              />
            </div>

            {/* SUBMIT */}
            <button
              disabled={submitting}
              className={`w-full py-3 rounded-xl text-white text-sm font-medium shadow transition ${
                submitting
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Menyimpan..." : "Simpan Event"}
            </button>
          </form>
        </main>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

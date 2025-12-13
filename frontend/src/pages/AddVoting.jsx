import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { createVoting } from "../services/api";
import Swal from "sweetalert2";

export default function AddVoting() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "draft",
  });

  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cleanup URL preview
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // VALIDASI SIZE
    if (file.size > 4 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Poster terlalu besar!",
        text: "Ukuran maksimal 4MB.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    // VALIDASI FORMAT
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Format tidak didukung",
        text: "Poster harus JPG atau PNG.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Judul wajib diisi",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      Swal.fire({
        icon: "error",
        title: "Tanggal tidak valid",
        text: "Tanggal selesai tidak boleh sebelum tanggal mulai",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    setLoading(true);

    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    if (poster) fd.append("poster", poster);

    try {
      await createVoting(fd);

      Swal.fire({
        icon: "success",
        title: "Voting berhasil dibuat!",
        text: "Anda akan diarahkan ke halaman voting.",
        showConfirmButton: false,
        timer: 1500,
      });

      setTimeout(() => navigate("/admin/voting"), 1200);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal membuat voting",
        text: err.response?.data?.message || "Terjadi kesalahan.",
        confirmButtonColor: "#dc2626",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Create Voting" />

      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main className="bg-white p-6 rounded-2xl border shadow-sm">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            ← Kembali
          </button>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Buat Voting Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">

            {/* TITLE */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Judul Voting
              </label>
              <input
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 shadow-sm focus:ring-2 focus:ring-blue-600"
                placeholder="Contoh: Pemilihan Ketua BEM"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 min-h-[100px] shadow-sm focus:ring-2 focus:ring-blue-600"
                placeholder="Deskripsi singkat..."
              />
            </div>

            {/* POSTER */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Poster Voting
              </label>

              <div className="mt-2 flex items-start gap-4">
                {/* PREVIEW */}
                <div className="w-40 h-40 rounded-xl bg-gray-50 border flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm">No Preview</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl cursor-pointer text-sm font-medium hover:bg-blue-100 border">
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG/PNG, max 4MB
                  </p>
                </div>
              </div>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => updateForm("start_date", e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 shadow-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => updateForm("end_date", e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 shadow-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* STATUS */}
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 bg-white shadow-sm focus:ring-2 focus:ring-blue-600"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-medium shadow transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Menyimpan..." : "Buat Voting"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

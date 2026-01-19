import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { createVoting } from "../services/api";
import Swal from "sweetalert2";

export default function CreateVoting() {
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

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePoster = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // VALIDASI SIZE
    if (file.size > 4 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran Terlalu Besar",
        text: "Poster maksimal 4MB.",
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    // VALIDASI TYPE
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Format Tidak Valid",
        text: "Poster harus berformat JPG atau PNG.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    if (poster) fd.append("poster", poster);

    try {
      await createVoting(fd);

      // SUKSES
      Swal.fire({
        icon: "success",
        title: "Voting Dibuat!",
        text: "Voting berhasil ditambahkan ke sistem.",
        confirmButtonColor: "#2563eb",
      }).then(() => {
        navigate("/admin/voting");
      });
    } catch (err) {
      console.error(err);

      // GAGAL
      Swal.fire({
        icon: "error",
        title: "Gagal Membuat Voting",
        text: "Terjadi kesalahan saat menyimpan voting.",
        confirmButtonColor: "#dc2626",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Create Voting" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-4xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            ← Kembali
          </button>

          <main className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              Create Voting
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* TITLE */}
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border p-3 shadow-sm min-h-[120px] focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* POSTER */}
              <div>
                <label className="text-sm font-medium text-gray-700">Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePoster}
                  className="mt-1 text-sm"
                />

                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    className="mt-3 w-48 rounded-xl border shadow-sm"
                  />
                )}
              </div>

              {/* DATE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white shadow font-medium transition ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Menyimpan..." : "Save"}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Swal from "sweetalert2";

export default function AddEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cleanup preview memory leak
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
        title: "File terlalu besar!",
        text: "Ukuran poster maksimal 4MB.",
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
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("date", form.date);
      fd.append("location", form.location);
      if (poster) fd.append("poster", poster);

      await api.post("/events", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Event berhasil dibuat!",
        text: "Event Anda sudah tersimpan.",
        showConfirmButton: false,
        timer: 1500,
      });

      setTimeout(() => navigate("/admin/events"), 1200);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal membuat event",
        text: err.response?.data?.message || "Terjadi kesalahan.",
        confirmButtonColor: "#dc2626",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Add Event" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-4xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            ← Kembali
          </button>

          <main className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Buat Event Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
              {/* TITLE */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Judul Event
                </label>
                <input
                  type="text"
                  className="w-full mt-1 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Contoh: Seminar UIKA 2025"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  required
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Deskripsi Event
                </label>
                <textarea
                  className="w-full mt-1 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none min-h-[120px]"
                  placeholder="Tuliskan deskripsi singkat event..."
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                />
              </div>

              {/* DATE */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tanggal Event
                </label>
                <input
                  type="date"
                  className="w-full mt-1 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  value={form.date}
                  onChange={(e) => updateForm("date", e.target.value)}
                  required
                />
              </div>

              {/* LOCATION */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Lokasi
                </label>
                <input
                  type="text"
                  className="w-full mt-1 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Contoh: Aula Utama UIKA"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                />
              </div>

              {/* POSTER */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Poster Event
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 text-sm"
                  onChange={handlePosterChange}
                />

                {preview && (
                  <img
                    src={preview}
                    className="mt-3 w-64 rounded-xl border shadow-sm"
                    alt="Poster Preview"
                  />
                )}
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
                {loading ? "Menyimpan..." : "Buat Event"}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

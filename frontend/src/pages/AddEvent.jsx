import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AddEvent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cleanup preview URL agar tidak bocor memory
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handlePosterChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validasi ukuran file (max 4MB sesuai Laravel)
    if (file.size > 4 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 4MB");
      return;
    }

    // Validasi jenis file
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      alert("Poster harus berupa JPG / JPEG / PNG");
      return;
    }

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("location", location);

      if (poster) {
        formData.append("poster", poster);
      }

      await api.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Event berhasil ditambahkan! 🎉");
      navigate("/admin/events");
    } catch (err) {
      console.error("Gagal menambah event:", err);
      alert("Gagal menambahkan event!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Add Event" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN CONTENT */}
        <main className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Buat Event Baru</h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* TITLE */}
            <div>
              <label className="block font-medium">Judul Event</label>
              <input
                type="text"
                placeholder="Contoh: Seminar UIKA 2025"
                className="w-full border p-2 rounded-xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block font-medium">Deskripsi</label>
              <textarea
                className="w-full border p-2 rounded-xl"
                placeholder="Tuliskan detail event..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* TANGGAL */}
            <div>
              <label className="block font-medium">Tanggal</label>
              <input
                type="date"
                className="w-full border p-2 rounded-xl"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* LOKASI */}
            <div>
              <label className="block font-medium">Lokasi</label>
              <input
                type="text"
                placeholder="Contoh: Aula Utama UIKA"
                className="w-full border p-2 rounded-xl"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* POSTER UPLOAD */}
            <div>
              <label className="block font-medium mb-2">Poster Event</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePosterChange}
                className="block w-full border p-2 rounded-xl"
              />

              {preview && (
                <img
                  src={preview}
                  className="mt-3 w-64 rounded-xl shadow"
                />
              )}
            </div>

            <button
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition shadow font-semibold"
            >
              {loading ? "Membuat Event..." : "Buat Event"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

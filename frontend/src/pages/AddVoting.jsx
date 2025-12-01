import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { createVoting } from "../services/api";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    if (poster) fd.append("poster", poster);

    try {
      await createVoting(fd);
      alert("Voting berhasil dibuat!");
      navigate("/admin/voting");
    } catch (err) {
      console.error(err);
      alert("Gagal membuat voting");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Create Voting" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN CARD */}
        <main className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create Voting</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* JUDUL */}
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DESKRIPSI */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* POSTER */}
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Poster Voting
                </label>
                <div className="border rounded-2xl p-3 flex flex-col items-center justify-center bg-gray-50">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview Poster"
                      className="w-40 h-40 object-cover rounded-xl border mb-2"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                      Preview poster
                    </div>
                  )}

                  <label className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-xl bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100">
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterChange}
                      className="hidden"
                    />
                  </label>

                  <p className="mt-1 text-[11px] text-gray-400 text-center">
                    Format: JPG/PNG, maks 2MB
                  </p>
                </div>
              </div>

              {/* INFO TAMBAHAN (opsional, bisa kosong dulu) */}
              <div className="text-xs text-gray-500 md:mt-8">
                Poster ini akan tampil di halaman voting mahasiswa dan di kartu
                daftar voting pada halaman admin.
              </div>
            </div>

            {/* TANGGAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="inline-flex items-center rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
            >
              Simpan
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

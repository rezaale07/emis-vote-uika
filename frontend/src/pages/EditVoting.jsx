import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { updateVoting } from "../services/api";

export default function EditVoting() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "draft",
  });

  const [poster, setPoster] = useState(null);
  const [oldPoster, setOldPoster] = useState(null);
  const [preview, setPreview] = useState(null);

  // 🔧 Fix URL poster (tanpa VITE_API_URL salah path)
  const buildPosterUrl = (filename) => {
    if (!filename) return null;

    const base = api.defaults.baseURL || "";
    const root = base.replace(/\/api\/?$/, ""); // http://127.0.0.1:8000

    return `${root}/storage/voting_posters/${filename}`;
  };

  // 🔄 Load data voting
  useEffect(() => {
    api.get(`/votings/${id}`).then((res) => {
      const v = res.data;

      setForm({
        title: v.title,
        description: v.description ?? "",
        start_date: v.start_date ?? "",
        end_date: v.end_date ?? "",
        status: v.status,
      });

      setOldPoster(v.poster ? buildPosterUrl(v.poster) : null);
      setLoading(false);
    });
  }, []);

  // 🔄 Form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🖼️ Saat upload poster baru
  const handlePoster = (e) => {
    const file = e.target.files[0];
    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  // 💾 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    if (poster) fd.append("poster", poster);

    try {
      await updateVoting(id, fd);
      alert("Voting berhasil diperbarui!");
      navigate("/admin/voting");
    } catch (err) {
      console.error(err);
      alert("Gagal update voting.");
    }
  };

  // 🔄 Loading skeleton
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse p-6">
        <Navbar title="Edit Voting" />
        <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="rounded-2xl border bg-white p-6 shadow">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
            <div className="h-10 bg-gray-200 rounded mb-4" />
            <div className="h-40 bg-gray-200 rounded mb-4" />
          </main>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Edit Voting" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="rounded-2xl border bg-white p-6 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 rounded-lg border px-3 py-1 hover:bg-gray-100 transition"
          >
            ← Back
          </button>

          <h2 className="text-xl font-semibold mb-4">Edit Voting</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TITLE */}
            <div>
              <label className="block font-medium mb-1">Judul</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-300"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block font-medium mb-1">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 min-h-[100px] focus:ring focus:ring-blue-300"
              />
            </div>

            {/* POSTER FIXED */}
            <div>
              <label className="block font-medium mb-1">Poster Voting</label>

              <div className="flex items-start gap-6">
                {/* GAMBAR */}
                <div>
                  {!preview && oldPoster && (
                    <img
                      src={oldPoster}
                      className="w-40 h-40 object-cover rounded-xl border shadow-sm"
                      alt="old-poster"
                    />
                  )}

                  {preview && (
                    <img
                      src={preview}
                      className="w-40 h-40 object-cover rounded-xl border shadow-sm"
                      alt="new-preview"
                    />
                  )}

                  {!oldPoster && !preview && (
                    <div className="w-40 h-40 rounded-xl border border-dashed flex items-center justify-center text-xs text-gray-400">
                      No poster
                    </div>
                  )}
                </div>

                {/* BUTTON UPLOAD */}
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-sm hover:bg-blue-100 transition">
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePoster}
                      className="hidden"
                    />
                  </label>

                  <p className="text-xs text-gray-400 mt-2">
                    Format: JPG/PNG max 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* DATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-300"
                />
              </div>
            </div>

            {/* STATUS */}
            <div>
              <label className="block font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 bg-white focus:ring focus:ring-blue-300"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="rounded-xl bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 transition"
            >
              Save Changes
            </button>

          </form>
        </main>
      </div>
    </div>
  );
}

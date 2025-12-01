import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { createVoting } from "../services/api";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePoster = (e) => {
    const file = e.target.files[0];
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
        <div className="hidden md:block"><Sidebar /></div>

        <main className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold mb-4">Create Voting</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border p-2"
              ></textarea>
            </div>

            {/* Poster Upload */}
            <div>
              <label className="block text-sm font-medium">Poster</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePoster}
                className="mt-1"
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-2 w-40 rounded-xl border"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border p-2"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 text-white px-4 py-2"
            >
              Save
            </button>
          </form>

        </main>
      </div>
    </div>
  );
}

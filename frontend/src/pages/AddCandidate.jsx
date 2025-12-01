import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function AddCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", bio: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("bio", form.bio);
    if (file) fd.append("photo", file);

    try {
      await api.post(`/votings/${id}/options`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Kandidat berhasil ditambahkan!");
      navigate(`/admin/voting/${id}/candidates`);
    } catch (err) {
      console.error(err);
      alert("Gagal menambah kandidat.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Add Candidate" />
      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <Sidebar className="hidden md:block" />

        <main className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Add Candidate</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border rounded-xl p-2"
              placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <textarea
              className="w-full border rounded-xl p-2"
              placeholder="Bio"
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />

            {preview && (
              <img
                src={preview}
                className="w-28 h-28 rounded-full object-cover border"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />

            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl">
              Save
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

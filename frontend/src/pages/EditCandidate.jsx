import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function EditCandidate() {
  const { id, cid } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    photo: ""
  });

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get(`/votings/${id}/options`).then((res) => {
      const candidate = res.data.find((c) => Number(c.id) === Number(cid));
      if (candidate) {
        setForm({
          name: candidate.name,
          bio: candidate.bio,
          photo: candidate.photo
        });
        setPreview(candidate.photo_url);
      }
    });
  }, [id, cid]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("bio", form.bio);

    // METHOD OVERRIDE FIX
    fd.append("_method", "PUT");

    if (file) fd.append("photo", file);

    try {
      await api.post(`/votings/${id}/options/${cid}`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Kandidat berhasil diperbarui!");
      navigate(`/admin/voting/${id}/candidates`);
    } catch (err) {
      console.error(err);
      alert("Gagal update kandidat!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Edit Candidate" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="rounded-2xl border bg-white p-6 shadow-sm">

          <button
            onClick={() => navigate(-1)}
            className="mb-4 rounded-lg border px-3 py-1 hover:bg-gray-100"
          >
            ← Back
          </button>

          <h2 className="text-xl font-semibold mb-4">Edit Candidate</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="font-medium">Nama Kandidat</label>
              <input
                className="w-full border rounded-xl p-2"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-medium">Bio</label>
              <textarea
                className="w-full border rounded-xl p-2"
                name="bio"
                value={form.bio}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="font-medium">Foto Kandidat</label>

              {preview && (
                <img
                  src={preview}
                  className="w-28 h-28 rounded-full object-cover border mb-2"
                />
              )}

              <input type="file" accept="image/*" onChange={handleFile} />
            </div>

            <button className="bg-blue-600 text-white rounded-xl px-4 py-2">
              Update
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

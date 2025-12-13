import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Swal from "sweetalert2";

export default function AddCandidate() {
  const { id } = useParams(); // votingId
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", bio: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nama wajib diisi!",
        text: "Silakan isi nama kandidat terlebih dahulu.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("bio", form.bio);
    if (file) fd.append("photo", file);

    try {
      await api.post(`/votings/${id}/options`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kandidat berhasil ditambahkan.",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate(`/admin/voting/${id}/candidates`);
      }, 1200);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal menambahkan kandidat",
        text: err.response?.data?.message || "Terjadi kesalahan.",
        confirmButtonColor: "#dc2626",
      });
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Add Candidate" />

        {/* CONTENT WRAPPER */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-4xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            ← Back
          </button>

          <main className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Tambah Kandidat
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kandidat
                </label>
                <input
                  className="w-full border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Masukkan nama kandidat"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* BIO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio / Deskripsi
                </label>
                <textarea
                  className="w-full border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none min-h-[120px]"
                  placeholder="Tulis deskripsi singkat kandidat"
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              {/* PHOTO PREVIEW */}
              {preview && (
                <div className="flex items-center gap-4">
                  <img
                    src={preview}
                    className="w-28 h-28 rounded-xl object-cover border shadow"
                  />
                </div>
              )}

              {/* UPLOAD FILE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto Kandidat
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={(e) => {
                    const img = e.target.files[0];
                    setFile(img);
                    setPreview(URL.createObjectURL(img));
                  }}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                disabled={submitting}
                className={`w-full py-3 rounded-xl text-white text-sm font-medium shadow transition ${
                  submitting
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting ? "Menyimpan..." : "Simpan Kandidat"}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

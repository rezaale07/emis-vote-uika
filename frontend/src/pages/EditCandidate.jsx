import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Swal from "sweetalert2";

export default function EditCandidate() {
  const { id, cid } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    photo: "",
  });

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load data kandidat
  useEffect(() => {
    let isMounted = true;

    async function loadCandidate() {
      try {
        const res = await api.get(`/votings/${id}/options`);
        const candidate = res.data.find((c) => Number(c.id) === Number(cid));

        if (!isMounted) return;

        if (candidate) {
          setForm({
            name: candidate.name || "",
            bio: candidate.bio || "",
            photo: candidate.photo || "",
          });
          setPreview(candidate.photo_url || null);
        } else {
          Swal.fire({
            icon: "error",
            title: "Kandidat Tidak Ditemukan",
            text: "Data kandidat tidak tersedia.",
            confirmButtonColor: "#2563eb",
          }).then(() => {
            navigate(`/admin/voting/${id}/candidates`);
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: "Terjadi kesalahan saat memuat data kandidat.",
          confirmButtonColor: "#dc2626",
        }).then(() => {
          navigate(`/admin/voting/${id}/candidates`);
        });
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    loadCandidate();

    return () => {
      isMounted = false;
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [id, cid]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (f.size > 4 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran Terlalu Besar",
        text: "Ukuran foto maksimal 4MB.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(f.type)) {
      Swal.fire({
        icon: "error",
        title: "Format Tidak Valid",
        text: "Foto harus berformat JPG atau PNG.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nama Belum Diisi",
        text: "Nama kandidat wajib diisi.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("bio", form.bio);
    fd.append("_method", "PUT");

    if (file) fd.append("photo", file);

    try {
      await api.post(`/votings/${id}/options/${cid}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kandidat berhasil diperbarui.",
        confirmButtonColor: "#2563eb",
      }).then(() => {
        navigate(`/admin/voting/${id}/candidates`);
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: "Terjadi kesalahan saat mengupdate kandidat.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Edit Candidate" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-4xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            ← Back
          </button>

          <main className="rounded-2xl border bg-white p-6 shadow-sm">
            {loadingData ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
                <div className="h-24 bg-gray-200 rounded-xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Edit Candidate
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kandidat
                    </label>
                    <input
                      className="w-full border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
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
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                    />
                  </div>

                  {/* PHOTO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto Kandidat
                    </label>

                    {preview && (
                      <div className="mb-3">
                        <img
                          src={preview}
                          className="w-28 h-28 rounded-xl object-cover border shadow-sm"
                          alt="Foto Kandidat"
                        />
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: JPG/PNG, maks 4MB.
                    </p>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3 rounded-xl text-white text-sm font-medium shadow transition ${
                      submitting
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {submitting ? "Menyimpan..." : "Update Kandidat"}
                  </button>
                </form>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { updateVoting } from "../services/api";
import Swal from "sweetalert2";

export default function EditVoting() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "draft",
  });

  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);

  // Build storage path
  const buildPosterUrl = (filename) => {
    if (!filename) return null;
    const base = api.defaults.baseURL || "";
    const root = base.replace(/\/api\/?$/, "");
    return `${root}/storage/voting_posters/${filename}`;
  };

  // Load Voting Data
  useEffect(() => {
    let mounted = true;

    api
      .get(`/votings/${id}`)
      .then((res) => {
        if (!mounted) return;

        if (!res.data) {
          Swal.fire({
            icon: "error",
            title: "Voting Tidak Ditemukan",
            text: "Data voting tidak tersedia.",
            confirmButtonColor: "#2563eb",
          }).then(() => navigate("/admin/voting"));
          return;
        }

        const v = res.data;

        setForm({
          title: v.title,
          description: v.description ?? "",
          start_date: v.start_date ?? "",
          end_date: v.end_date ?? "",
          status: v.status ?? "draft",
        });

        setPreview(v.poster ? buildPosterUrl(v.poster) : null);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: "Terjadi kesalahan saat mengambil data voting.",
          confirmButtonColor: "#dc2626",
        }).then(() => navigate("/admin/voting"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [id]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Poster Upload
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran Terlalu Besar",
        text: "Poster maksimal 4MB.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Format Tidak Sesuai",
        text: "Poster harus berformat JPG atau PNG.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  // Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      icon: "question",
      title: "Simpan Perubahan?",
      text: "Pastikan semua data sudah benar.",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);

    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    if (poster) fd.append("poster", poster);

    try {
      await updateVoting(id, fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Voting berhasil diperbarui.",
        confirmButtonColor: "#2563eb",
      }).then(() => navigate("/admin/voting"));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Mengupdate",
        text: "Terjadi kesalahan saat mengupdate voting.",
        confirmButtonColor: "#dc2626",
      });
    }

    setSaving(false);
  };

  // ==========================
  // LOADING SKELETON
  // ==========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex flex-col">
          <Navbar title="Edit Voting" />
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto animate-pulse space-y-5">
            <div className="h-6 bg-gray-300 w-40 rounded"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // MAIN RENDER
  // ==========================
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Edit Voting" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto fade-in">

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            ← Kembali
          </button>

          <main className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">

            <h2 className="text-xl font-semibold text-gray-900">Edit Voting</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* TITLE */}
              <Input label="Judul Voting">
                <input
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  className="input"
                  required
                />
              </Input>

              {/* DESCRIPTION */}
              <Input label="Deskripsi">
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  className="textarea"
                />
              </Input>

              {/* POSTER */}
              <Input label="Poster Voting">
                <div className="mt-2 flex items-start gap-4">
                  <div className="w-40 h-40 rounded-xl bg-gray-50 border flex items-center justify-center overflow-hidden shadow-sm">
                    {preview ? (
                      <img src={preview} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-sm">No Poster</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl cursor-pointer text-sm font-medium hover:bg-blue-100 border">
                      Upload Poster Baru
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Format JPG/PNG • Maks 4MB
                    </p>
                  </div>
                </div>
              </Input>

              {/* DATES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Start Date">
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => updateForm("start_date", e.target.value)}
                    className="input"
                    required
                  />
                </Input>

                <Input label="End Date">
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => updateForm("end_date", e.target.value)}
                    className="input"
                    required
                  />
                </Input>
              </div>

              {/* STATUS */}
              <Input label="Status">
                <select
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                  className="input bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </Input>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 rounded-xl text-white font-medium shadow transition ${
                  saving
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

            </form>
          </main>
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 12px;
          border-radius: 0.75rem;
          box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
          outline: none;
          transition: 0.2s;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px #2563eb40;
        }
        .textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 12px;
          border-radius: 0.75rem;
          min-height: 120px;
          box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
          outline: none;
          transition: 0.2s;
        }
        .textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px #2563eb40;
        }
      `}</style>
    </div>
  );
}

// ============================
// REUSABLE WRAPPER
// ============================
function Input({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

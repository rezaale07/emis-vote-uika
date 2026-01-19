import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { createVoting } from "../services/api";
import Swal from "sweetalert2";

/* =========================
   SUBMIT BUTTON
========================= */
function SubmitButton({ loading, text }) {
  return (
    <button
      disabled={loading}
      className={`w-full py-3 rounded-xl text-white text-sm font-medium shadow transition ${
        loading
          ? "bg-blue-300 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Menyimpan...
        </span>
      ) : (
        text
      )}
    </button>
  );
}

/* =========================
   INPUT WRAPPER
========================= */
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* =========================
     POSTER CHANGE
  ========================= */
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      Swal.fire("Peringatan", "Poster maksimal 4MB", "warning");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      Swal.fire("Error", "Poster harus JPG atau PNG", "error");
      return;
    }

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      Swal.fire("Validasi", "Judul voting wajib diisi", "warning");
      return;
    }

    if (
      form.start_date &&
      form.end_date &&
      form.start_date > form.end_date
    ) {
      Swal.fire(
        "Tanggal Tidak Valid",
        "Tanggal selesai tidak boleh sebelum tanggal mulai",
        "error"
      );
      return;
    }

    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (poster) fd.append("poster", poster);

    try {
      await createVoting(fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Voting berhasil dibuat",
        timer: 1400,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/admin/voting"), 1200);
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Navbar title="Add Voting" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="rounded-2xl border bg-white p-6 shadow-sm max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-xl border px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            ← Kembali
          </button>

          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
              Voting
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Buat Voting Baru
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 fade-up">
            <Input label="Judul Voting">
              <input
                className="input"
                placeholder="Contoh: Pemilihan Ketua BEM"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                required
              />
            </Input>

            <Input label="Deskripsi">
              <textarea
                className="textarea"
                placeholder="Deskripsi singkat voting"
                value={form.description}
                onChange={(e) =>
                  updateForm("description", e.target.value)
                }
              />
            </Input>

            <Input label="Poster Voting">
              <div className="flex items-start gap-4">
                <div className="w-40 h-40 rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                  {preview ? (
                    <img
                      src={preview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">
                      No Poster
                    </span>
                  )}
                </div>

                <label className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl cursor-pointer text-sm font-medium hover:bg-blue-100 border">
                  Upload Poster
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </label>
              </div>
            </Input>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Tanggal Mulai">
                <input
                  type="date"
                  className="input"
                  value={form.start_date}
                  onChange={(e) =>
                    updateForm("start_date", e.target.value)
                  }
                />
              </Input>

              <Input label="Tanggal Selesai">
                <input
                  type="date"
                  className="input"
                  value={form.end_date}
                  onChange={(e) =>
                    updateForm("end_date", e.target.value)
                  }
                />
              </Input>
            </div>

            <Input label="Status">
              <select
                className="input bg-white"
                value={form.status}
                onChange={(e) =>
                  updateForm("status", e.target.value)
                }
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </Input>

            <SubmitButton loading={saving} text="Buat Voting" />
          </form>
        </main>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        .fade-up { animation: fadeUp .25s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 12px;
          border-radius: 0.75rem;
          box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
          outline: none;
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
        }
      `}</style>
    </div>
  );
}

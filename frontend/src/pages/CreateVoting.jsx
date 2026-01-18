import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { createVoting } from "../services/api";
import Swal from "sweetalert2";

/* =========================
   INPUT WRAPPER
========================= */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* =========================
     POSTER
  ========================= */
  const handlePoster = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      Swal.fire("Peringatan", "Poster maksimal 4MB", "warning");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      Swal.fire("Format Tidak Valid", "Poster harus JPG atau PNG", "error");
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
      return Swal.fire("Validasi", "Judul voting wajib diisi", "warning");
    }

    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      return Swal.fire(
        "Tanggal Tidak Valid",
        "Tanggal selesai tidak boleh sebelum tanggal mulai",
        "error"
      );
    }

    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (poster) fd.append("poster", poster);

    try {
      await createVoting(fd);

      Swal.fire({
        icon: "success",
        title: "Voting Berhasil Dibuat",
        text: "Data voting berhasil disimpan.",
        timer: 1400,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/admin/voting"), 1200);
    } catch (err) {
      Swal.fire(
        "Gagal",
        err?.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">

          {/* HEADER */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Kembali
            </button>

            <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
              Voting
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
              Buat Voting Baru
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Tambahkan voting baru untuk pemilihan kampus.
            </p>
          </div>

          {/* FORM CARD */}
          <main className="rounded-3xl border bg-white p-6 shadow-sm max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">

              <Field label="Judul Voting" required>
                <input
                  className="input"
                  placeholder="Contoh: Pemilihan Ketua BEM"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                />
              </Field>

              <Field label="Deskripsi">
                <textarea
                  className="textarea"
                  placeholder="Deskripsi singkat voting"
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                />
              </Field>

              <Field label="Poster Voting">
                <div className="flex items-start gap-4">
                  <div className="w-40 h-40 rounded-2xl border bg-slate-50 flex items-center justify-center overflow-hidden shadow-sm">
                    {preview ? (
                      <img
                        src={preview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-400 text-sm">
                        No Poster
                      </span>
                    )}
                  </div>

                  <label className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl cursor-pointer text-sm font-semibold hover:bg-blue-100 border border-blue-100">
                    Upload Poster
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePoster}
                      className="hidden"
                    />
                  </label>
                </div>
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Tanggal Mulai">
                  <input
                    type="date"
                    className="input"
                    value={form.start_date}
                    onChange={(e) =>
                      updateForm("start_date", e.target.value)
                    }
                  />
                </Field>

                <Field label="Tanggal Selesai">
                  <input
                    type="date"
                    className="input"
                    value={form.end_date}
                    onChange={(e) =>
                      updateForm("end_date", e.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="Status">
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
              </Field>

              <button
                disabled={saving}
                className={`w-full py-3 rounded-xl text-white font-semibold shadow transition ${
                  saving
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? "Menyimpan..." : "Buat Voting"}
              </button>
            </form>
          </main>

          <div className="text-center text-xs text-slate-400">
            © 2025 UIKA IT Division
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 12px;
          border-radius: 0.9rem;
          outline: none;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px #2563eb25;
        }
        .textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 12px;
          border-radius: 0.9rem;
          min-height: 120px;
          outline: none;
        }
        .textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px #2563eb25;
        }
      `}</style>
    </div>
  );
}

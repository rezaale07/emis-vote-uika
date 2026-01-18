import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { createVoting } from "../services/api";
import Swal from "sweetalert2";

/* =========================
   UI ATOMS
========================= */
function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <label className="text-sm font-semibold text-slate-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition
      focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none min-h-[120px] transition
      focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  );
}

function PrimaryButton({ loading, children }) {
  return (
    <button
      disabled={loading}
      type="submit"
      className={[
        "w-full rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-sm transition",
        loading
          ? "bg-blue-300 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 active:translate-y-[1px]",
      ].join(" ")}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Menyimpan...
        </span>
      ) : (
        children
      )}
    </button>
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
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
        "Tanggal tidak valid",
        "Tanggal selesai tidak boleh sebelum tanggal mulai",
        "error"
      );
    }

    const confirm = await Swal.fire({
      title: "Buat Voting?",
      text: "Pastikan data voting sudah benar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (poster) fd.append("poster", poster);

      await createVoting(fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Voting berhasil dibuat",
        timer: 1200,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/admin/voting"), 800);
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

      {/* CONTENT */}
      <div className="md:pl-64 pt-[56px] md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* HEADER */}
          <div className="mb-6">
            <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
              Admin • Voting
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Buat Voting Baru
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Buat voting baru untuk proses pemilihan kampus.
                </p>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
              >
                ← Kembali
              </button>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Judul Voting" required>
                <Input
                  placeholder="Contoh: Pemilihan Ketua BEM"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                />
              </Field>

              <Field label="Deskripsi" hint="Opsional">
                <Textarea
                  placeholder="Deskripsi singkat voting"
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                />
              </Field>

              <Field label="Poster Voting" hint="JPG / PNG (opsional)">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-40 h-40 rounded-3xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Poster"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-slate-400">
                        No Poster
                      </span>
                    )}
                  </div>

                  <label className="cursor-pointer rounded-2xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 border border-blue-100 hover:bg-blue-100 transition">
                    Upload Poster
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setPoster(f);
                        setPreview(URL.createObjectURL(f));
                      }}
                    />
                  </label>
                </div>
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Tanggal Mulai">
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      updateForm("start_date", e.target.value)
                    }
                  />
                </Field>

                <Field label="Tanggal Selesai">
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      updateForm("end_date", e.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="Status">
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

              <PrimaryButton loading={saving}>
                Buat Voting
              </PrimaryButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

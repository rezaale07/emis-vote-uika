import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
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
      className={[
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none",
        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition",
      ].join(" ")}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none",
        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition min-h-[120px]",
      ].join(" ")}
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

export default function AddEventVote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return Swal.fire("Validasi", "Nama event wajib diisi", "warning");
    }

    const confirm = await Swal.fire({
      title: "Tambah Event Voting?",
      text: "Pastikan data sudah benar.",
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
      fd.append("name", name.trim());
      fd.append("bio", description || "");
      if (file) fd.append("photo", file);

      await api.post(`/votings/${id}/options`, fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Event voting berhasil ditambahkan",
        timer: 1200,
        showConfirmButton: false,
      });

      setTimeout(
        () => navigate(`/admin/voting/${id}/event-vote`),
        700
      );
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
                  Tambah Event Voting
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Tambahkan kandidat / event voting ke dalam sistem.
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

          {/* CARD */}
          <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Nama Event / Kandidat" required>
                <Input
                  placeholder="Contoh: Kandidat Ketua BEM"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>

              <Field label="Deskripsi" hint="Opsional">
                <Textarea
                  placeholder="Deskripsi singkat mengenai event / kandidat"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>

              <Field label="Poster / Foto" hint="Opsional (JPG / PNG)">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-40 h-40 rounded-3xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-slate-400">No Image</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-2xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 border border-blue-100 hover:bg-blue-100 transition">
                      Upload Gambar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setFile(f);
                          setPreview(URL.createObjectURL(f));
                        }}
                      />
                    </label>

                    {preview && (
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(preview);
                          setPreview(null);
                          setFile(null);
                        }}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </Field>

              <PrimaryButton loading={saving}>
                Simpan Event Voting
              </PrimaryButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

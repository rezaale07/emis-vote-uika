import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import Swal from "sweetalert2";

/* =========================
   UI ATOMS
========================= */
function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
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
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition
      focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition
      focus:border-blue-500 focus:ring-4 focus:ring-blue-100 min-h-[120px]"
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
      {loading ? "Menyimpan..." : children}
    </button>
  );
}

/* =========================
   SKELETON
========================= */
function FormSkeleton() {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
      <div className="h-8 w-48 bg-slate-200 rounded mb-6" />

      <div className="space-y-6">
        <div className="h-11 bg-slate-200 rounded-xl" />
        <div className="h-28 bg-slate-200 rounded-xl" />
        <div className="h-36 bg-slate-200 rounded-xl" />
        <div className="h-11 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function EditEventVote() {
  const { id, optionId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    let mounted = true;

    api
      .get(`/votings/${id}`)
      .then((res) => {
        if (!mounted) return;

        const opt = res.data.options?.find(
          (o) => Number(o.id) === Number(optionId)
        );

        if (!opt) throw new Error();

        setName(opt.name || "");
        setDescription(opt.bio || "");
        setPreview(opt.photo_url || null);
      })
      .catch(() =>
        Swal.fire("Error", "Event voting tidak ditemukan", "error").then(() =>
          navigate(-1)
        )
      )
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [id, optionId, navigate, preview]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return Swal.fire("Validasi", "Nama event wajib diisi", "warning");
    }

    setSaving(true);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("bio", description || "");
    fd.append("_method", "PUT");
    if (file) fd.append("photo", file);

    try {
      await api.post(`/votings/${id}/options/${optionId}`, fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Event voting berhasil diperbarui",
        timer: 1200,
        showConfirmButton: false,
      });

      navigate(`/admin/voting/${id}/event-vote`);
    } catch {
      Swal.fire("Gagal", "Gagal memperbarui event voting", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Edit Event Voting" subtitle="Admin • Voting">
      <main className="flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          {/* HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
                Event Voting
              </p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                Edit Event Voting
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Perbarui informasi kandidat / event voting.
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
            >
              ← Kembali
            </button>
          </div>

          {/* FORM */}
          {loading ? (
            <FormSkeleton />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Nama Event / Kandidat" required>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>

                <Field label="Deskripsi" hint="Opsional">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>

                <Field label="Poster Event" hint="JPG / PNG (opsional)">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-40 h-40 rounded-3xl border bg-slate-50 flex items-center justify-center overflow-hidden">
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
                      Ganti Poster
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </Field>

                <PrimaryButton loading={saving}>
                  Simpan Perubahan
                </PrimaryButton>
              </form>
            </div>
          )}

          <div className="text-center text-xs text-slate-400 pt-4">
            © 2025 UIKA IT Division
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}

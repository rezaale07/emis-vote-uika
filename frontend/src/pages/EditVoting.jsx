import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api, { updateVoting } from "../services/api";
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

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    let mounted = true;

    api
      .get(`/votings/${id}`)
      .then((res) => {
        if (!mounted) return;

        const v = res.data;
        if (!v) throw new Error();

        setForm({
          title: v.title || "",
          description: v.description || "",
          start_date: (v.start_date || "").slice(0, 10),
          end_date: (v.end_date || "").slice(0, 10),
          status: v.status || "draft",
        });

        setPoster(null);
        setPreview(v.poster_url || null);
      })
      .catch(() => {
        Swal.fire("Error", "Voting tidak ditemukan", "error").then(() =>
          navigate("/admin/voting")
        );
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [id, navigate, preview]);

  const updateFormField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* =========================
     POSTER
  ========================= */
  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      Swal.fire("Peringatan", "Poster maksimal 4MB", "warning");
      return;
    }

    // revoke blob lama kalau ada
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return prev;
    });

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
        "Tanggal tidak valid",
        "Tanggal selesai tidak boleh sebelum tanggal mulai",
        "error"
      );
    }

    const confirm = await Swal.fire({
      title: "Simpan Perubahan?",
      text: "Perubahan akan diterapkan ke voting ini.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (poster) fd.append("poster", poster);

    try {
      await updateVoting(id, fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Voting berhasil diperbarui",
        timer: 1200,
        showConfirmButton: false,
      });

      navigate("/admin/voting");
    } catch {
      Swal.fire("Gagal", "Gagal memperbarui voting", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Edit Voting" subtitle="Admin • Voting">
      <main className="flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          {/* HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
                Voting
              </p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                Edit Voting
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Perbarui detail voting, poster, dan status.
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
                <Field label="Judul Voting" required>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      updateFormField("title", e.target.value)
                    }
                    required
                  />
                </Field>

                <Field label="Deskripsi" hint="Opsional">
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      updateFormField("description", e.target.value)
                    }
                  />
                </Field>

                <Field label="Poster Voting" hint="Opsional (max 4MB)">
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
                      Ganti Poster
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="hidden"
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
                        updateFormField("start_date", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Tanggal Selesai">
                    <Input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        updateFormField("end_date", e.target.value)
                      }
                    />
                  </Field>
                </div>

                <Field label="Status">
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    value={form.status}
                    onChange={(e) =>
                      updateFormField("status", e.target.value)
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </Field>

                <PrimaryButton loading={saving}>Simpan Perubahan</PrimaryButton>
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

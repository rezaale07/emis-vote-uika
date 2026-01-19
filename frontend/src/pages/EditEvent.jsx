import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import Swal from "sweetalert2";

/* =========================
   HELPERS
========================= */
const toEventDateTime = (date, time) => {
  if (!date) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? time : "23:59";
  const dt = new Date(`${date}T${t}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const isExpiredDateTime = (date, time) => {
  const dt = toEventDateTime(date, time);
  return dt ? dt.getTime() < Date.now() : false;
};

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
      className={[
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition",
        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
      ].join(" ")}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition",
        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 min-h-[120px]",
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
      {loading ? "Menyimpan..." : children}
    </button>
  );
}

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "08:00",
    location: "",
    status: "active",
  });

  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);

  const expired = useMemo(
    () => isExpiredDateTime(form.date, form.time),
    [form.date, form.time]
  );

  const updateForm = (k, v) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  /* =========================
     LOAD EVENT
  ========================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get(`/events/${id}`);
        if (!mounted) return;

        const ev = res.data;
        setForm({
          title: ev.title || "",
          description: ev.description || "",
          date: (ev.date || "").slice(0, 10),
          time: ev.time?.slice(0, 5) || "08:00",
          location: ev.location || "",
          status: ev.status || "active",
        });

        setPreview(ev.poster_url || null);
        setPoster(null);
      } catch {
        Swal.fire("Error", "Event tidak ditemukan", "error").then(() =>
          navigate("/admin/events")
        );
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* =========================
     POSTER
  ========================= */
  const handlePoster = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      return Swal.fire("Peringatan", "Poster maksimal 4MB", "warning");
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      return Swal.fire("Error", "Format poster tidak valid", "error");
    }

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearPoster = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPoster(null);
    setPreview(null);
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return Swal.fire("Validasi", "Judul wajib diisi", "warning");
    }

    const confirm = await Swal.fire({
      title: "Simpan Perubahan?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#2563eb",
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.set("status", expired ? "expired" : form.status);

      if (poster) fd.append("poster", poster);
      fd.append("_method", "PUT");

      await api.post(`/events/${id}`, fd);

      Swal.fire({
        icon: "success",
        title: "Event Diperbarui",
        timer: 1200,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/admin/events"), 800);
    } catch {
      Swal.fire("Gagal", "Gagal menyimpan perubahan", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Edit Event" subtitle="Admin • Event">
      <main className="flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          {/* HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
                Event
              </p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                Edit Event
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Perbarui informasi event kampus.
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {expired && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Waktu event sudah lewat. Status akan otomatis menjadi{" "}
                <b>EXPIRED</b>.
              </div>
            )}

            {loading ? (
              <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Judul Event" required>
                  <Input
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                  />
                </Field>

                <Field label="Deskripsi">
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      updateForm("description", e.target.value)
                    }
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Tanggal" required>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => updateForm("date", e.target.value)}
                    />
                  </Field>

                  <Field label="Jam" required>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={(e) => updateForm("time", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Lokasi">
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      updateForm("location", e.target.value)
                    }
                  />
                </Field>

                <Field label="Poster Event" hint="jpg/png/webp, max 4MB">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-40 h-40 rounded-3xl border bg-slate-50 flex items-center justify-center overflow-hidden">
                      {preview ? (
                        <img
                          src={preview}
                          className="w-full h-full object-cover"
                          alt="Poster"
                        />
                      ) : (
                        <span className="text-sm text-slate-400">
                          No Poster
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer rounded-2xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 border border-blue-100 hover:bg-blue-100 transition">
                        Upload Poster
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePoster}
                          className="hidden"
                        />
                      </label>

                      {preview && (
                        <button
                          type="button"
                          onClick={clearPoster}
                          className="rounded-2xl border px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Hapus Poster
                        </button>
                      )}
                    </div>
                  </div>
                </Field>

                <PrimaryButton loading={saving}>
                  Simpan Perubahan
                </PrimaryButton>
              </form>
            )}
          </div>

          <div className="text-center text-xs text-slate-400 pt-4">
            © 2025 UIKA IT Division
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}

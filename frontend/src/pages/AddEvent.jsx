import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../layouts/AdminLayout";
import Swal from "sweetalert2";

/* =========================
   HELPERS (DATE + TIME)
========================= */
const pad2 = (n) => String(n).padStart(2, "0");

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const toEventDateTime = (date, time) => {
  if (!date) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? time : "23:59";
  const dt = new Date(`${date}T${t}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const isExpiredDateTime = (date, time) => {
  const dt = toEventDateTime(date, time);
  if (!dt) return false;
  return dt.getTime() < Date.now();
};

/* =========================
   UI ATOMS
========================= */
function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <label className="text-sm font-semibold text-slate-800">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
        {hint ? <span className="text-[11px] text-slate-500">{hint}</span> : null}
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
        props.className || "",
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
        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition",
        "min-h-[120px]",
        props.className || "",
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

export default function AddEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: todayISO(),
    time: "08:00",
    location: "",
    status: "active",
  });

  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const expiredByDateTime = useMemo(
    () => isExpiredDateTime(form.date, form.time),
    [form.date, form.time]
  );

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const updateForm = (key, value) =>
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

    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      Swal.fire("Error", "Poster harus JPG/PNG/WEBP", "error");
      return;
    }

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearPoster = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setPoster(null);
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return Swal.fire("Wajib diisi", "Judul event tidak boleh kosong.", "warning");
    }
    if (!form.date) {
      return Swal.fire("Wajib diisi", "Tanggal event wajib diisi.", "warning");
    }
    if (!form.time || !/^\d{2}:\d{2}$/.test(form.time)) {
      return Swal.fire("Wajib diisi", "Jam event wajib diisi (HH:MM).", "warning");
    }

    if (expiredByDateTime) {
      const warn = await Swal.fire({
        icon: "warning",
        title: "Waktu event sudah lewat",
        text: "Jika disimpan, status akan otomatis menjadi EXPIRED. Lanjutkan?",
        showCancelButton: true,
        confirmButtonText: "Lanjut",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc2626",
      });
      if (!warn.isConfirmed) return;
    } else {
      const confirm = await Swal.fire({
        title: "Buat Event?",
        text: "Pastikan data sudah benar.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Buat",
        cancelButtonText: "Batal",
        confirmButtonColor: "#2563eb",
      });
      if (!confirm.isConfirmed) return;
    }

    setSaving(true);

    try {
      const fd = new FormData();
      const finalStatus = expiredByDateTime ? "expired" : form.status;

      fd.append("title", form.title.trim());
      fd.append("description", form.description || "");
      fd.append("date", form.date);
      fd.append("time", form.time);
      fd.append("location", form.location || "");
      fd.append("status", finalStatus);
      if (poster) fd.append("poster", poster);

      await api.post("/events", fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Event berhasil dibuat.",
        timer: 1200,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/admin/events"), 700);
    } catch (err) {
      Swal.fire("Gagal", err?.response?.data?.message || "Terjadi kesalahan", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add Event" subtitle="Admin • Event">
      <main className="flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          {/* HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
                Admin • Event
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                Tambah Event Baru
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Isi informasi event dengan lengkap, termasuk jam acara.
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

          {/* FORM CARD */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {expiredByDateTime && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Tanggal & jam yang dipilih sudah lewat. Saat disimpan, status akan
                otomatis menjadi <b>EXPIRED</b>.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Judul Event" required>
                <Input
                  placeholder="Contoh: Seminar UIKA 2025"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  required
                />
              </Field>

              <Field label="Deskripsi Event" hint="Opsional">
                <Textarea
                  placeholder="Deskripsi singkat event"
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Tanggal Event"
                  required
                  hint="Tidak disarankan pilih tanggal lampau"
                >
                  <Input
                    type="date"
                    value={form.date}
                    min={todayISO()}
                    onChange={(e) => updateForm("date", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Jam Event" required hint="Format: HH:MM">
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field label="Lokasi" hint="Opsional">
                <Input
                  placeholder="Contoh: Aula Utama UIKA"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                />
              </Field>

              <Field label="Status" hint="Default Active (auto expired jika waktu lewat)">
                <select
                  className={[
                    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none",
                    "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition",
                    expiredByDateTime ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                  disabled={expiredByDateTime}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </Field>

              <Field label="Poster Event" hint="JPG/PNG/WEBP max 4MB">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-44 h-44 rounded-3xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-400 text-sm">No Poster</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <label className="px-4 py-2.5 rounded-2xl cursor-pointer text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition">
                      Upload Poster
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="hidden"
                      />
                    </label>

                    {preview && (
                      <button
                        type="button"
                        onClick={clearPoster}
                        className="px-4 py-2.5 rounded-2xl border text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Hapus Poster
                      </button>
                    )}
                  </div>
                </div>
              </Field>

              <PrimaryButton loading={saving}>Buat Event</PrimaryButton>
            </form>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
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
   UI PARTS
========================= */
function Field({ label, hint, required, children }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <label className="text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SubmitButton({ loading, text }) {
  return (
    <button
      disabled={loading}
      type="submit"
      className={`w-full py-3 rounded-xl text-white font-semibold shadow transition ${
        loading
          ? "bg-blue-300 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? "Menyimpan..." : text}
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

  // poster file + preview
  const [poster, setPoster] = useState(null); // File
  const [preview, setPreview] = useState(null); // string URL (blob atau URL server)

  const expired = useMemo(
    () => isExpiredDateTime(form.date, form.time),
    [form.date, form.time]
  );

  const updateForm = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

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

        // preview dari server (bukan blob)
        setPoster(null);
        setPreview(ev.poster_url || null);
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

  // cleanup untuk preview blob biar nggak bocor memory
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* =========================
     POSTER HANDLER
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

    // revoke blob lama (kalau sebelumnya preview adalah blob)
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return prev;
    });

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearPosterSelection = () => {
    setPoster(null);
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
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

      // status dipaksa expired kalau waktunya sudah lewat (sesuai UI)
      fd.set("status", expired ? "expired" : form.status);

      // upload poster (optional)
      if (poster) fd.append("poster", poster);

      // Laravel method spoofing (paling aman untuk multipart)
      fd.append("_method", "PUT");

      await api.post(`/events/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Event Diperbarui",
        timer: 1400,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/admin/events"), 900);
    } catch (err) {
      Swal.fire("Gagal", "Gagal menyimpan perubahan", "error");
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
              type="button"
            >
              ← Kembali
            </button>

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

          {/* FORM */}
          <main className="rounded-3xl border bg-white p-6 shadow-sm max-w-3xl">
            {expired && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Waktu event sudah lewat. Status akan otomatis menjadi{" "}
                <b>EXPIRED</b>.
              </div>
            )}

            {loading ? (
              <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Judul Event" required>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                  />
                </Field>

                <Field label="Deskripsi">
                  <textarea
                    className="textarea"
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                  />
                </Field>

                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Tanggal" required>
                    <input
                      type="date"
                      className="input"
                      value={form.date}
                      onChange={(e) => updateForm("date", e.target.value)}
                    />
                  </Field>

                  <Field label="Jam" required>
                    <input
                      type="time"
                      className="input"
                      value={form.time}
                      onChange={(e) => updateForm("time", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Lokasi">
                  <input
                    className="input"
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                  />
                </Field>

                <Field label="Poster Event" hint="jpg/png/webp, maks 4MB">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                    <div className="w-full sm:w-44">
                      <div className="aspect-square rounded-2xl border bg-slate-50 flex items-center justify-center overflow-hidden">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Poster preview"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No Poster
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <label className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl cursor-pointer font-semibold text-sm hover:bg-blue-100 border">
                        Upload Poster
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePoster}
                          className="hidden"
                        />
                      </label>

                      {poster && (
                        <button
                          type="button"
                          onClick={clearPosterSelection}
                          className="px-4 py-2 rounded-xl border text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Batal pilih
                        </button>
                      )}
                    </div>
                  </div>
                </Field>

                <SubmitButton loading={saving} text="Simpan Perubahan" />
              </form>
            )}
          </main>

          <div className="text-center text-xs text-slate-400">
            © 2025 UIKA IT Division
          </div>
        </div>
      </div>

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

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Swal from "sweetalert2";

/* =========================
   HELPERS (DATE + TIME)
========================= */
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
   SKELETON
========================= */
function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-1/3 bg-gray-200 rounded" />
      <div className="h-10 bg-gray-200 rounded-xl" />
      <div className="h-28 bg-gray-200 rounded-xl" />
      <div className="h-40 bg-gray-200 rounded-xl" />
      <div className="h-10 bg-gray-200 rounded-xl" />
    </div>
  );
}

/* =========================
   SUBMIT BUTTON
========================= */
function SubmitButton({ loading, text }) {
  return (
    <button
      disabled={loading}
      className={`w-full py-3 rounded-xl text-white text-sm font-semibold shadow-sm transition ${
        loading
          ? "bg-blue-300 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
      type="submit"
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
function Field({ label, hint, required, children }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <label className="block text-sm font-semibold text-gray-800">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
        {hint ? (
          <span className="text-[11px] text-gray-500">{hint}</span>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
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

  const expiredByDate = useMemo(
    () => isExpiredDateTime(form.date, form.time),
    [form.date, form.time]
  );

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get(`/events/${id}`);
        if (!mounted) return;

        const ev = res.data;
        if (!ev) throw new Error("Event not found");

        setForm({
          title: ev.title || "",
          description: ev.description || "",
          date: (ev.date || "").slice(0, 10), // keep yyyy-mm-dd
          time: ev.time && /^\d{2}:\d{2}/.test(ev.time) ? ev.time.slice(0, 5) : "08:00",
          location: ev.location || "",
          status: ev.status || "active",
        });

        setPreview(ev.poster_url || null);
      } catch {
        Swal.fire("Error", "Event tidak ditemukan", "error").then(() =>
          navigate("/admin/events")
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* =========================
     POSTER CHANGE
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

    setPoster(file);
    const next = URL.createObjectURL(file);

    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(next);
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

    const confirm = await Swal.fire({
      title: "Simpan Perubahan?",
      text: "Perubahan akan diterapkan ke event ini.",
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

      // Auto-expired kalau tanggal+jam sudah lewat
      const finalStatus = expiredByDate ? "expired" : form.status;

      fd.append("title", form.title);
      fd.append("description", form.description || "");
      fd.append("date", form.date);
      fd.append("time", form.time); // ✅ NEW
      fd.append("location", form.location || "");
      fd.append("status", finalStatus);

      if (poster) fd.append("poster", poster);

      await api.post(`/events/${id}?_method=PUT`, fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Event berhasil diperbarui",
        timer: 1400,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/admin/events"), 900);
    } catch (err) {
      Swal.fire(
        "Gagal",
        err?.response?.data?.message || "Gagal memperbarui event",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Navbar title="Edit Event" />

      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="rounded-2xl border bg-white p-6 shadow-sm max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-xl border px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
            type="button"
          >
            ← Kembali
          </button>

          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
              Event
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Edit Event
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Ubah detail event, termasuk tanggal & jam.
            </p>
          </div>

          {loading ? (
            <FormSkeleton />
          ) : (
            <>
              {expiredByDate ? (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Tanggal & jam event sudah lewat. Saat disimpan, status akan otomatis menjadi{" "}
                  <b>EXPIRED</b>.
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-6 fade-up">
                <Field label="Judul Event" required>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Deskripsi" hint="Opsional">
                  <textarea
                    className="textarea"
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Tanggal Event" required>
                    <input
                      type="date"
                      className="input"
                      value={form.date}
                      onChange={(e) => updateForm("date", e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Jam Event" required hint="Format: HH:MM">
                    <input
                      type="time"
                      className="input"
                      value={form.time}
                      onChange={(e) => updateForm("time", e.target.value)}
                      required
                    />
                  </Field>
                </div>

                <Field label="Lokasi" hint="Opsional">
                  <input
                    className="input"
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                  />
                </Field>

                <Field label="Status" hint="Auto expired jika waktu lewat">
                  <select
                    className="input bg-white"
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                    disabled={expiredByDate}
                    title={expiredByDate ? "Tanggal+jam sudah lewat → status otomatis expired" : ""}
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </Field>

                <Field label="Poster Event" hint="JPG/PNG/WEBP max 4MB">
                  <div className="flex items-start gap-4">
                    <div className="w-44 h-44 rounded-2xl border bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                      {preview ? (
                        <img
                          src={preview}
                          className="w-full h-full object-cover"
                          alt="Poster Preview"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No Poster</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl cursor-pointer text-sm font-semibold hover:bg-blue-100 border border-blue-100 inline-flex items-center justify-center">
                        Upload Poster
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterChange}
                          className="hidden"
                        />
                      </label>

                      {preview ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
                            setPreview(null);
                            setPoster(null);
                          }}
                          className="px-4 py-2 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Hapus Poster
                        </button>
                      ) : null}
                    </div>
                  </div>
                </Field>

                <SubmitButton loading={saving} text="Simpan Perubahan" />
              </form>
            </>
          )}
        </main>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        .fade-up { animation: fadeUp .25s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 12px;
          border-radius: 0.85rem;
          box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px #2563eb20;
        }
        .textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 12px;
          border-radius: 0.85rem;
          min-height: 120px;
          outline: none;
        }
        .textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px #2563eb20;
        }
      `}</style>
    </div>
  );
}

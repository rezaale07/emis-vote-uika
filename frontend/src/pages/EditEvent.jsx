import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Swal from "sweetalert2";

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

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    status: "active",
  });

  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    let mounted = true;

    api
      .get(`/events/${id}`)
      .then((res) => {
        if (!mounted) return;
        const ev = res.data;
        if (!ev) throw new Error();

        setForm({
          title: ev.title || "",
          description: ev.description || "",
          date: ev.date || "",
          location: ev.location || "",
          status: ev.status || "active",
        });

        setPreview(ev.poster_url || null);
      })
      .catch(() => {
        Swal.fire("Error", "Event tidak ditemukan", "error").then(() =>
          navigate("/admin/events")
        );
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [id]);

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

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Simpan Perubahan?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (poster) fd.append("poster", poster);

    try {
      await api.post(`/events/${id}?_method=PUT`, fd);
      Swal.fire("Berhasil", "Event berhasil diperbarui", "success").then(() =>
        navigate("/admin/events")
      );
    } catch {
      Swal.fire("Gagal", "Gagal memperbarui event", "error");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
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
            className="mb-6 rounded-xl border px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
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
          </div>

          {loading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 fade-up">
              <Input label="Judul Event">
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) =>
                    updateForm("title", e.target.value)
                  }
                  required
                />
              </Input>

              <Input label="Deskripsi">
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                />
              </Input>

              <Input label="Tanggal Event">
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={(e) =>
                    updateForm("date", e.target.value)
                  }
                />
              </Input>

              <Input label="Lokasi">
                <input
                  className="input"
                  value={form.location}
                  onChange={(e) =>
                    updateForm("location", e.target.value)
                  }
                />
              </Input>

              <Input label="Status">
                <select
                  className="input bg-white"
                  value={form.status}
                  onChange={(e) =>
                    updateForm("status", e.target.value)
                  }
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </Input>

              <Input label="Poster Event">
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

              <SubmitButton
                loading={saving}
                text="Simpan Perubahan"
              />
            </form>
          )}
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

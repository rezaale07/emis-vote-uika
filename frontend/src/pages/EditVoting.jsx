import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api, { updateVoting } from "../services/api";
import Swal from "sweetalert2";

/* =========================
   SKELETON
========================= */
function FormSkeleton() {
  return (
    <div className="max-w-3xl rounded-3xl border bg-white p-6 shadow-sm animate-pulse">
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
          start_date: v.start_date || "",
          end_date: v.end_date || "",
          status: v.status || "draft",
        });

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
  }, [id]);

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
        timer: 1400,
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
              Edit Voting
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Perbarui detail voting, poster, dan status.
            </p>
          </div>

          {/* FORM */}
          {loading ? (
            <FormSkeleton />
          ) : (
            <main className="max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* TITLE */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Judul Voting <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Deskripsi
                  </label>
                  <textarea
                    className="textarea"
                    value={form.description}
                    onChange={(e) =>
                      updateForm("description", e.target.value)
                    }
                  />
                </div>

                {/* POSTER */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Poster Voting
                  </label>

                  <div className="mt-3 flex items-start gap-4">
                    <div className="w-36 h-36 rounded-2xl border bg-slate-50 flex items-center justify-center overflow-hidden">
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

                    <label className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl cursor-pointer font-semibold text-sm hover:bg-blue-100 border">
                      Ganti Poster
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* DATE */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={form.start_date}
                      onChange={(e) =>
                        updateForm("start_date", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={form.end_date}
                      onChange={(e) =>
                        updateForm("end_date", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Status
                  </label>
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
                </div>

                {/* SUBMIT */}
                <button
                  disabled={saving}
                  className={`w-full py-3 rounded-xl text-white font-semibold shadow transition ${
                    saving
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </main>
          )}

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

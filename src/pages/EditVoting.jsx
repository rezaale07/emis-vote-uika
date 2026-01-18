import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { updateVoting } from "../services/api";
import Swal from "sweetalert2";

/* =========================
   SKELETON FORM
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
      await updateVoting(id, fd);
      Swal.fire("Berhasil", "Voting berhasil diperbarui", "success").then(() =>
        navigate("/admin/voting")
      );
    } catch {
      Swal.fire("Gagal", "Gagal memperbarui voting", "error");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Navbar title="Edit Voting" />

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
              Voting
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Edit Voting
            </h2>
          </div>

          {loading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 fade-up">
              <Input label="Judul Voting">
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  required
                />
              </Input>

              <Input label="Deskripsi">
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                />
              </Input>

              <Input label="Poster Voting">
                <div className="flex items-start gap-4">
                  <div className="w-40 h-40 rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                    {preview ? (
                      <img
                        src={preview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Poster</span>
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

              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Start Date">
                  <input
                    type="date"
                    className="input"
                    value={form.start_date}
                    onChange={(e) =>
                      updateForm("start_date", e.target.value)
                    }
                  />
                </Input>

                <Input label="End Date">
                  <input
                    type="date"
                    className="input"
                    value={form.end_date}
                    onChange={(e) =>
                      updateForm("end_date", e.target.value)
                    }
                  />
                </Input>
              </div>

              <Input label="Status">
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

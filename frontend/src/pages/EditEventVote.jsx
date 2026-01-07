import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
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
  }, [id, optionId]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire("Validasi", "Nama event wajib diisi", "warning");
      return;
    }

    setSaving(true);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("bio", description);
    fd.append("_method", "PUT");
    if (file) fd.append("photo", file);

    try {
      await api.post(`/votings/${id}/options/${optionId}`, fd);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Event voting berhasil diperbarui",
        timer: 1300,
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
              Event Voting
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
              Edit Event Voting
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Perbarui informasi kandidat / event voting.
            </p>
          </div>

          {/* FORM */}
          {loading ? (
            <FormSkeleton />
          ) : (
            <main className="max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* NAME */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Nama Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* POSTER */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Poster Event
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
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
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

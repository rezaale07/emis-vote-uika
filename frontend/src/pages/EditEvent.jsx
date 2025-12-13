import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Swal from "sweetalert2";

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

  // ===========================
  // LOAD EVENT DATA
  // ===========================
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await api.get(`/events/${id}`);
        if (!mounted) return;

        const ev = res.data;

        if (!ev) {
          Swal.fire({
            icon: "error",
            title: "Event Tidak Ditemukan",
            text: "Event yang Anda cari tidak tersedia.",
            confirmButtonColor: "#2563eb",
          }).then(() => navigate("/admin/events"));
          return;
        }

        setForm({
          title: ev.title,
          description: ev.description,
          date: ev.date,
          location: ev.location,
          status: ev.status ?? "active",
        });

        setPreview(ev.poster_url);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Event",
          text: "Terjadi kesalahan saat mengambil data event.",
          confirmButtonColor: "#dc2626",
        }).then(() => navigate("/admin/events"));
      }

      if (mounted) setLoading(false);
    }

    load();

    return () => {
      mounted = false;
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [id]);

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran Terlalu Besar",
        text: "Poster maksimal berukuran 4MB.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Format Tidak Valid",
        text: "Poster harus berformat JPG atau PNG.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setPoster(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("date", form.date);
      fd.append("location", form.location);
      fd.append("status", form.status);
      if (poster) fd.append("poster", poster);

      await api.post(`/events/${id}?_method=PUT`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Event berhasil diperbarui.",
        confirmButtonColor: "#2563eb",
      }).then(() => navigate("/admin/events"));
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal Update Event",
        text: "Terjadi kesalahan saat mengupdate event.",
        confirmButtonColor: "#dc2626",
      });
    }

    setSaving(false);
  };

  // ===========================
  // LOADING SKELETON
  // ===========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex flex-col">
          <Navbar title="Edit Event" />

          <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-4xl mx-auto animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
            <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-56 bg-gray-200 rounded-xl"></div>
            <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // MAIN UI
  // ===========================
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title="Edit Event" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto fade-in">

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 border bg-white rounded-xl shadow hover:bg-gray-100 transition"
          >
            ← Kembali
          </button>

          <main className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>

              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium shadow
                  ${
                    form.status === "active"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
              >
                {form.status === "active" ? "Active" : "Expired"}
              </span>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">

              <InputField
                label="Judul Event"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
              />

              <TextareaField
                label="Deskripsi"
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
              />

              <InputField
                type="date"
                label="Tanggal Event"
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
              />

              <InputField
                label="Lokasi"
                value={form.location}
                onChange={(e) => updateForm("location", e.target.value)}
              />

              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status Event
                </label>
                <select
                  className="w-full mt-1 rounded-xl border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* POSTER */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Poster Event
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="mt-1"
                />

                {preview && (
                  <img
                    src={preview}
                    className="mt-3 w-64 h-40 object-cover rounded-xl border shadow-sm"
                  />
                )}
              </div>

              {/* SUBMIT */}
              <button
                disabled={saving}
                className="w-full py-3 rounded-xl text-white font-semibold shadow
                bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition"
              >
                {saving ? "Menyimpan..." : "Update Event"}
              </button>
            </form>
          </main>
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(4px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ============================
// REUSABLE COMPONENTS
// ============================
function InputField({ label, className = "", ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        {...props}
        className={`w-full mt-1 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
      />
    </div>
  );
}

function TextareaField({ label, className = "", ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        {...props}
        className={`w-full mt-1 border rounded-xl p-3 min-h-[120px] shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
      ></textarea>
    </div>
  );
}

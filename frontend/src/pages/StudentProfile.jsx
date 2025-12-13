// pages/StudentProfile.jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Swal from "sweetalert2";

/* ======================== UTIL: FORMAT DATE ======================== */
const formatDate = (isoDate) => {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/* ========================== SKELETON HISTORY ======================== */
function HistorySkeleton() {
  return (
    <div className="animate-pulse p-4 rounded-2xl border bg-slate-50">
      <div className="h-4 w-1/3 bg-slate-200 rounded" />
      <div className="h-3 w-1/4 bg-slate-100 rounded mt-2" />
    </div>
  );
}

/* ========================== MAIN COMPONENT ========================= */
export default function StudentProfile() {
  const { user, updateUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [history, setHistory] = useState([]);

  /* ======================== SYNC USER → FORM ======================== */
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  /* ========================= LOAD HISTORY ========================= */
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const res = await api.get(`/users/${user.id}/history`);
        setHistory(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil riwayat:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    load();
  }, [user?.id]);

  /* ========================= SAVE PROFILE ========================= */
  const saveProfile = async () => {
    if (!form.name.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Nama wajib diisi",
        text: "Silakan isi nama lengkap Anda.",
        confirmButtonColor: "#2563eb",
      });
    }

    if (!form.username.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "NPM wajib diisi",
        text: "Silakan isi NPM Anda.",
        confirmButtonColor: "#2563eb",
      });
    }

    if (form.password.trim() !== "" && form.password.length < 4) {
      return Swal.fire({
        icon: "warning",
        title: "Password terlalu pendek",
        text: "Password minimal 4 karakter.",
        confirmButtonColor: "#2563eb",
      });
    }

    setSaving(true);

    const payload = {
      name: form.name,
      username: form.username,
      email: form.email,
    };

    if (form.password.trim() !== "") {
      payload.password = form.password;
    }

    try {
      const res = await api.put(`/students/${user.id}`, payload);

      updateUser({
        name: res.data.student.name,
        email: res.data.student.email,
        username: res.data.student.username,
      });

      setForm((prev) => ({ ...prev, password: "" }));

      await Swal.fire({
        icon: "success",
        title: "Profil diperbarui",
        text: "Data profil Anda telah berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: "Terjadi kesalahan saat memperbarui profil.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ========================= INITIALS ========================= */
  const initials = (form.name || "M")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      <StudentNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* TOP HEADER CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_#ffffff44,_transparent_60%)]" />

          <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-blue-100">
                EMIS-Vote UIKA
              </p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold">
                Profil Mahasiswa
              </h1>
              <p className="mt-1 text-sm md:text-base text-blue-100 max-w-xl">
                Kelola data akun, NPM, dan riwayat event yang pernah kamu ikuti.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/10 border border-white/40 flex items-center justify-center text-2xl md:text-3xl font-extrabold shadow-sm">
                {initials}
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold">{form.name || "-"}</p>
                <p className="text-xs text-blue-100">
                  NPM: <span className="font-medium">{form.username || "-"}</span>
                </p>
                <p className="text-xs text-blue-100 mt-1">
                  Status: <span className="font-semibold">Mahasiswa Aktif</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID: PROFILE CARD + FORM */}
        <div className="grid md:grid-cols-[1fr,1.6fr] gap-6">

          {/* PROFILE SUMMARY CARD */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-100 via-sky-100 to-indigo-100 text-blue-700 flex items-center justify-center text-4xl font-extrabold shadow-sm border border-white" >
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[11px] px-2 py-0.5 rounded-full shadow">
                Online
              </div>
            </div>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              {form.name || "Mahasiswa UIKA"}
            </h2>

            <p className="text-slate-500 text-sm">
              {form.email || "Belum ada email terisi"}
            </p>

            <div className="mt-3 w-full space-y-2 text-sm text-slate-600">
              <div className="flex justify-between border rounded-xl px-3 py-2 bg-slate-50">
                <span className="text-slate-500">NPM</span>
                <span className="font-semibold text-slate-800">
                  {form.username || "-"}
                </span>
              </div>
              <div className="flex justify-between border rounded-xl px-3 py-2 bg-slate-50">
                <span className="text-slate-500">Role</span>
                <span className="font-semibold text-slate-800">
                  Mahasiswa
                </span>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400">
              Data ini digunakan untuk kebutuhan login dan proses voting.
            </p>
          </section>

          {/* EDIT PROFILE FORM */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Edit Profil
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Perbarui data diri kamu di bawah ini.
            </p>

            <div className="mt-5 space-y-4">
              <Input
                label="Nama Lengkap"
                value={form.name}
                onChange={(v) => setForm((prev) => ({ ...prev, name: v }))}
              />

              <Input
                label="NPM"
                value={form.username}
                onChange={(v) => setForm((prev) => ({ ...prev, username: v }))}
              />

              <Input
                label="Email"
                placeholder="email@uika-bogor.ac.id"
                value={form.email}
                onChange={(v) => setForm((prev) => ({ ...prev, email: v }))}
              />

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password Baru <span className="text-slate-400">(opsional)</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPw ? "text" : "password"}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-slate-50"
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold shadow hover:bg-blue-700 transition disabled:bg-blue-300"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </section>
        </div>

        {/* =================== HISTORY =================== */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Riwayat Event
            </h3>
            <p className="text-xs text-slate-500">
              Event yang pernah kamu daftarkan / ikuti.
            </p>
          </div>

          {loadingHistory ? (
            <div className="mt-4 space-y-3">
              <HistorySkeleton />
              <HistorySkeleton />
            </div>
          ) : history.length === 0 ? (
            <p className="text-slate-500 mt-3 text-sm">
              Belum ada riwayat event yang tercatat.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="p-4 rounded-2xl border bg-slate-50 hover:bg-slate-100 transition shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-slate-900 text-sm md:text-base">
                      {h.event_title}
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Tanggal: {formatDate(h.event_date)}
                    </p>
                  </div>

                  <span className="inline-flex items-center text-[11px] px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                    Event
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <style>{`
        .fade-in { animation: fadeIn .35s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* =================== INPUT COMPONENT =================== */
function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-slate-50"
      />
    </div>
  );
}

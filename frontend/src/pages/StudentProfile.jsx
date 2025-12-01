import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";

export default function StudentProfile() {
  const { user, updateUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  // 🔎 Ambil riwayat event
  const loadHistory = async () => {
    try {
      const res = await api.get(`/users/${user.id}/history`);
      setHistory(res.data);
    } catch (err) {
      console.log("Gagal mengambil riwayat:", err);
    }
  };

  // 💾 Simpan profil (tanpa avatar)
  const saveProfile = async () => {
    setLoading(true);

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

      // update context + localStorage
      updateUser({
        name: res.data.student.name,
        email: res.data.student.email,
        username: res.data.student.username,
      });

      alert("Profil berhasil diperbarui!");
    } catch (err) {
      console.log(err);
      alert("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  // Inisial untuk bulatan profil
  const initials = (form.name || user?.name || "M")
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* KARTU PROFIL KIRI */}
          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold">
              {initials}
            </div>

            <h2 className="mt-3 text-xl font-semibold">
              {form.name || user?.name}
            </h2>
            <p className="text-gray-500 text-sm">
              {form.email || user?.email}
            </p>
            <p className="mt-1 text-gray-500 text-sm">
              NPM: <b>{form.username || user?.username}</b>
            </p>
          </div>

          {/* FORM EDIT KANAN */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold">Edit Profil</h3>

            <div className="mt-4 space-y-3">
              <Input
                label="Nama"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />

              <Input
                label="NPM"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
              />

              <Input
                label="Email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />

              {/* PASSWORD + SHOW/HIDE */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password (opsional)
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={loading}
              className="w-full mt-5 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        {/* RIWAYAT EVENT */}
        <div className="mt-10 bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold">Riwayat Event</h3>

          {history.length === 0 ? (
            <p className="text-gray-500 mt-3">Belum ada riwayat event.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.map((h) => (
                <li className="p-4 border rounded-xl bg-gray-50" key={h.id}>
                  <div className="font-semibold">{h.event_title}</div>
                  <div className="text-sm text-gray-600">
                    Tanggal: {h.event_date}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        className="w-full mt-1 px-3 py-2 border rounded-xl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

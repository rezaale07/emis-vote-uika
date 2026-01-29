import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const value = login.trim();

    if (!value) {
      return Swal.fire({
        icon: "warning",
        title: "Input Kosong",
        text: "Silakan masukkan NPM atau Email terlebih dahulu.",
        confirmButtonColor: "#2563eb",
      });
    }

    setLoading(true);

    try {
      await forgotPassword({ login: value });

      await Swal.fire({
        icon: "success",
        title: "Email Terkirim 📧",
        html: `
          <p>Link reset password berhasil dikirim.</p>
          <small style="color:#64748b">
            Silakan cek inbox atau folder spam email kamu.
          </small>
        `,
        confirmButtonColor: "#2563eb",
      });

      navigate("/login", { replace: true });
    } catch (err) {
      if (err.response?.status === 429) {
        Swal.fire({
          icon: "warning",
          title: "Terlalu Banyak Percobaan ⏳",
          text: "Silakan tunggu beberapa saat sebelum mencoba kembali.",
          confirmButtonColor: "#2563eb",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Mengirim",
          text:
            err.response?.data?.message ||
            "Mahasiswa tidak ditemukan atau email tidak valid.",
          confirmButtonColor: "#dc2626",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gray-50 animate-fade-in">
      {/* LEFT IMAGE */}
      <div className="relative hidden md:block">
        <img
          src="/img/uika.jpg"
          alt="UIKA"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-700/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white text-4xl font-bold drop-shadow-lg">
            EMIS-Vote UIKA
          </h1>
          <p className="mt-3 text-blue-100 text-lg font-medium">
            Reset Password Mahasiswa
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={submit}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border relative"
        >
          {/* BACK */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            disabled={loading}
            className="absolute left-5 top-5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            ← Kembali ke Login
          </button>

          <h2 className="text-2xl font-bold text-center text-gray-900">
            Lupa Password
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Masukkan NPM atau Email mahasiswa terdaftar
          </p>

          {/* INPUT */}
          <label className="block mt-6 text-sm font-medium text-gray-700">
            NPM / Email
          </label>

          <div className="relative mt-1">
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={loading}
              placeholder="2020xxxxxx / email@student.uika.ac.id"
              className="w-full px-4 py-3 border rounded-xl shadow-sm
                         focus:ring-2 focus:ring-blue-600 outline-none
                         disabled:bg-gray-100 pr-10"
              autoFocus
            />

            {login && !loading && (
              <button
                type="button"
                onClick={() => setLogin("")}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-xl text-white
              font-semibold shadow transition
              ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Mengirim Link..." : "Kirim Link Reset"}
          </button>

          <p className="mt-6 text-center text-xs text-gray-500">
            Powered by UIKA IT Division
          </p>
        </form>
      </div>

      {/* ANIMATION */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn .35s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

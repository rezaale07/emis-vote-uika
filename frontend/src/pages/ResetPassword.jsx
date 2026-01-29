import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/api";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = params.get("token");
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [redirectSec, setRedirectSec] = useState(null);

  const passwordTooShort = useMemo(() => password.length > 0 && password.length < 6, [password]);
  const confirmMismatch = useMemo(
    () => confirm.length > 0 && password !== confirm,
    [password, confirm]
  );

  // ======================
  // VALIDASI LINK
  // ======================
  useEffect(() => {
    if (!token || !email) {
      Swal.fire({
        icon: "error",
        title: "Link Tidak Valid",
        text: "Link reset password tidak lengkap atau sudah kadaluarsa.",
        confirmButtonColor: "#dc2626",
      }).then(() => navigate("/login", { replace: true }));
    }
  }, [token, email, navigate]);

  // ======================
  // AUTO REDIRECT COUNTDOWN
  // ======================
  useEffect(() => {
    if (redirectSec === null) return;

    if (redirectSec <= 0) {
      navigate("/login", { replace: true });
      return;
    }

    const t = setTimeout(() => setRedirectSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [redirectSec, navigate]);

  // ======================
  // SUBMIT
  // ======================
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!password || password.length < 6) {
      return Swal.fire({
        icon: "warning",
        title: "Password Lemah",
        text: "Password minimal 6 karakter.",
        confirmButtonColor: "#2563eb",
      });
    }

    if (password !== confirm) {
      return Swal.fire({
        icon: "error",
        title: "Password Tidak Cocok",
        text: "Password dan konfirmasi harus sama.",
        confirmButtonColor: "#dc2626",
      });
    }

    setLoading(true);

    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirm,
      });

      await Swal.fire({
        icon: "success",
        title: "Password Berhasil Direset 🎉",
        html: `Silakan login menggunakan password baru.<br/><small class="text-gray-500">Mengalihkan ke halaman login...</small>`,
        confirmButtonColor: "#2563eb",
        timer: 1400,
        showConfirmButton: false,
      });

      setRedirectSec(3);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Reset Password",
        text:
          err.response?.data?.message ||
          "Token reset tidak valid atau sudah kadaluarsa.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gray-50 fade-in">
      {/* LEFT IMAGE */}
      <div className="relative hidden md:block">
        <img
          src="/img/uika.jpg"
          alt="Reset Password"
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
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="absolute left-5 top-5 text-sm text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            ← Kembali ke Login
          </button>

          <h2 className="text-2xl font-bold text-center text-gray-900">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Masukkan password baru untuk akun kamu
          </p>

          {/* PASSWORD */}
          <label className="block mt-6 text-sm font-medium text-gray-700">
            Password Baru
          </label>

          <div className="relative mt-1">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-gray-100 pr-12 ${
                passwordTooShort ? "border-red-400" : ""
              }`}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
          {passwordTooShort && (
            <p className="mt-2 text-xs text-red-500">
              Password minimal 6 karakter.
            </p>
          )}

          {/* CONFIRM */}
          <label className="block mt-4 text-sm font-medium text-gray-700">
            Konfirmasi Password
          </label>

          <div className="relative mt-1">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              disabled={loading}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-gray-100 pr-12 ${
                confirmMismatch ? "border-red-400" : ""
              }`}
              placeholder="Ulangi password"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
          {confirmMismatch && (
            <p className="mt-2 text-xs text-red-500">
              Konfirmasi password belum sama.
            </p>
          )}

          {/* SUBMIT */}
          <button
            disabled={loading || passwordTooShort || confirmMismatch}
            className={`w-full mt-6 py-3 rounded-xl text-white font-semibold shadow transition ${
              loading || passwordTooShort || confirmMismatch
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memproses..." : "Reset Password"}
          </button>

          {/* REDIRECT INFO */}
          {redirectSec !== null && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Berhasil! Mengalihkan ke login dalam <b>{redirectSec}</b> detik...
            </p>
          )}

          <p className="mt-6 text-center text-xs text-gray-500">
            Powered by UIKA IT Division
          </p>
        </form>
      </div>

      {/* ANIMATION */}
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

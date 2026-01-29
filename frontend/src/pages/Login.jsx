import { useState, useContext, useEffect } from "react";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔐 THROTTLE STATE
  const [lockUntil, setLockUntil] = useState(null);
  const [remaining, setRemaining] = useState(0);

  // ⏱️ COUNTDOWN
  useEffect(() => {
    if (!lockUntil) return;

    const timer = setInterval(() => {
      const diff = Math.ceil((lockUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setLockUntil(null);
        setRemaining(0);
        clearInterval(timer);
      } else {
        setRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockUntil]);

  const submit = async (e) => {
    e.preventDefault();
    if (loading || lockUntil) return;

    setLoading(true);

    try {
      const { data } = await loginUser({
        login: loginField.trim(),
        password,
      });

      login(data);

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil 🎉",
        text: `Selamat datang, ${data.user.name}!`,
        timer: 1600,
        showConfirmButton: false,
      });

      navigate(
        data.user.role === "admin" ? "/admin" : "/student",
        { replace: true }
      );
    } catch (err) {
      // 🚫 THROTTLE (429)
      if (err.response?.status === 429) {
        const waitMs = 60 * 1000; // 1 menit (sesuai backend throttle)
        setLockUntil(Date.now() + waitMs);

        Swal.fire({
          icon: "warning",
          title: "Terlalu Banyak Percobaan 🚫",
          text: "Silakan tunggu 1 menit sebelum mencoba login kembali.",
          confirmButtonColor: "#2563eb",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: "NPM/Email atau Password yang kamu masukkan salah.",
          confirmButtonColor: "#dc2626",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || lockUntil;

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gray-50 fade-in">
      {/* LEFT IMAGE */}
      <div className="relative hidden md:block">
        <img src="/img/uika.jpg" alt="Login" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-blue-700/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white text-4xl font-bold">EMIS-Vote UIKA</h1>
          <p className="mt-3 text-blue-100 text-lg">
            Sistem E-Voting & Event Management
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
            onClick={() => navigate("/")}
            disabled={disabled}
            className="absolute left-5 top-5 text-sm text-gray-500 disabled:opacity-50"
          >
            ← Kembali
          </button>

          <h2 className="text-2xl font-bold text-center">Login</h2>
          <p className="text-sm text-gray-500 text-center">
            Masukkan NPM / Email dan Password
          </p>

          {/* LOGIN */}
          <label className="block mt-6 text-sm font-medium">NPM / Email</label>
          <input
            type="text"
            value={loginField}
            disabled={disabled}
            onChange={(e) => setLoginField(e.target.value)}
            className="w-full mt-1 px-4 py-3 border rounded-xl disabled:bg-gray-100"
            placeholder="2020xxxxxx / email@student.uika.ac.id"
            required
          />

          {/* PASSWORD */}
          <label className="block mt-4 text-sm font-medium">Password</label>
          <div className="relative mt-1">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              disabled={disabled}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl pr-12 disabled:bg-gray-100"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>

          {/* INFO LOCK */}
          {lockUntil && (
            <p className="mt-3 text-sm text-red-600 text-center">
              Terlalu banyak percobaan. Coba lagi dalam {remaining} detik ⏳
            </p>
          )}

          {/* SUBMIT */}
          <button
            disabled={disabled}
            className={`w-full mt-6 py-3 rounded-xl text-white font-semibold ${
              disabled
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          <p
            onClick={() => !disabled && navigate("/forgot-password")}
            className="mt-4 text-center text-sm text-blue-600 hover:underline cursor-pointer"
          >
            Lupa Password?
          </p>

          <p className="mt-6 text-center text-xs text-gray-500">
            Powered by UIKA IT Division
          </p>
        </form>
      </div>
    </div>
  );
}

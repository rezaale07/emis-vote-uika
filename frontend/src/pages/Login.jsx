import { useState, useContext } from "react";
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

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await loginUser({
        login: loginField,
        password,
      });

      login(data);

      // SUCCESS POPUP
      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang, ${data.user.name}!`,
        timer: 1600,
        showConfirmButton: false,
      });

      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/student", { replace: true });
      }

    } catch (err) {

      // ERROR POPUP
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: "NPM/Email atau Password yang kamu masukkan salah.",
        confirmButtonColor: "#dc2626",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gray-50 fade-in">

      {/* LEFT IMAGE / BRANDING */}
      <div className="relative hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1523246191549-2f9b3f1f3b9f?q=80&w=1600&auto=format&fit=crop"
          alt="Login Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-700/60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white text-4xl font-bold drop-shadow-lg">
            EMIS-Vote UIKA
          </h1>
          <p className="mt-3 text-blue-100 text-lg font-medium">
            Sistem E-Voting & Event Management UIKA Bogor
          </p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={submit}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Login
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Masukkan NPM / Email dan Password Anda
          </p>

          {/* LOGIN FIELD */}
          <label className="block mt-5 text-sm font-medium text-gray-700">
            NPM / Email
          </label>
          <input
            type="text"
            required
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
            className="w-full mt-1 px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
            placeholder="contoh: 2020xxxxxx / email@uika-bogor.ac.id"
          />

          {/* PASSWORD FIELD */}
          <label className="block mt-4 text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Masukkan password"
            />

            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg"
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-xl text-white font-semibold shadow transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          <p className="mt-6 text-center text-xs text-gray-500">
            Powered by UIKA IT Division
          </p>
        </form>
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn .4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}

import { useState, useContext } from "react";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [loginField, setLoginField] = useState(""); // NPM atau email
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await loginUser({
        login: loginField,
        password,
      });

      login(data);

      // Redirect berdasarkan role
      if (data.user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/student";
      }
    } catch (err) {
      setError("Login gagal. Periksa NPM/Email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* LEFT IMAGE */}
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-blue-700/60" />
        <img
          src="https://images.unsplash.com/photo-1523246191549-2f9b3f1f3b9f?q=80&w=1600&auto=format&fit=crop"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-4xl font-bold drop-shadow">EMIS-Vote UIKA</h1>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow">

          <h2 className="text-2xl font-bold text-center">Login</h2>
          <p className="text-sm text-gray-500 text-center">Masukkan NPM / Email & Password</p>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}

          <label className="block mt-5 text-sm font-medium">NPM / Email</label>
          <input
            type="text"
            required
            className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600"
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
          />

          <label className="block mt-4 text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* SHOW / HIDE BUTTON */}
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-500"
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          <p className="mt-6 text-center text-xs text-gray-500">
            Powered by UIKA IT Division
          </p>

        </form>
      </div>
    </div>
  );
}

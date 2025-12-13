import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ title }) {
  const { user } = useContext(AuthContext);

  // Jika mahasiswa → buat navbar versi student
  if (user?.role === "student") {
    return (
      <header className="w-full h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-30">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <span className="text-xs text-blue-600 font-semibold">Mahasiswa</span>
      </header>
    );
  }

  // Jika admin → navbar admin
  return (
    <header className="w-full h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-400">Powered by UIKA IT Division</p>
    </header>
  );
}

import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import Container from "./Container";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

/* =========================
   TAB STYLE
========================= */
const tabClass = (isActive) =>
  [
    "inline-flex items-center justify-center h-10 px-6 rounded-full text-sm font-semibold",
    "transition-all duration-200 select-none",
    isActive
      ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-[1.02]"
      : "text-slate-700 hover:bg-slate-100",
  ].join(" ");

export default function StudentNavbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const name = user?.name || "Mahasiswa";
  const role = "Mahasiswa";

  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Keluar dari akun?",
      text: "Anda akan logout dari dashboard mahasiswa.",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
      <Container className="py-3">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-5">
            {/* MOBILE TOGGLE */}
            <button
              className="md:hidden grid h-10 w-10 place-items-center rounded-xl border hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>

            {/* LOGO */}
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white">
                <img
                  src="/img/logouika.png"
                  alt="Logo UIKA"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <div className="text-sm font-extrabold text-slate-900 tracking-wide">
                  EMIS-Vote
                </div>
                <div className="text-[11px] text-slate-500 -mt-0.5">
                  Student Portal
                </div>
              </div>
            </div>

            {/* DESKTOP MENU */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink
                to="/student/events"
                className={({ isActive }) => tabClass(isActive)}
              >
                Event
              </NavLink>

              <NavLink
                to="/student/voting"
                className={({ isActive }) => tabClass(isActive)}
              >
                Voting
              </NavLink>

              <NavLink
                to="/timeline"
                className={({ isActive }) => tabClass(isActive)}
              >
                Timeline
              </NavLink>

              <NavLink
                to="/student/profile"
                className={({ isActive }) => tabClass(isActive)}
              >
                Profile
              </NavLink>
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* USER */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white text-xs font-bold">
                {initials}
              </div>

              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900">
                  {name}
                </div>
                <div className="text-[11px] text-slate-500">{role}</div>
              </div>
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-sm font-semibold
                         text-red-600 hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="mt-4 flex flex-col gap-2 md:hidden animate-fade">
            <NavLink
              to="/student/events"
              className={({ isActive }) => tabClass(isActive)}
              onClick={() => setOpen(false)}
            >
              Event
            </NavLink>

            <NavLink
              to="/student/voting"
              className={({ isActive }) => tabClass(isActive)}
              onClick={() => setOpen(false)}
            >
              Voting
            </NavLink>

            <NavLink
              to="/timeline"
              className={({ isActive }) => tabClass(isActive)}
              onClick={() => setOpen(false)}
            >
              Timeline
            </NavLink>

            <NavLink
              to="/student/profile"
              className={({ isActive }) => tabClass(isActive)}
              onClick={() => setOpen(false)}
            >
              Profile
            </NavLink>
          </div>
        )}
      </Container>

      {/* ANIMATION */}
      <style>{`
        .animate-fade {
          animation: fade .2s ease-out;
        }
        @keyframes fade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}

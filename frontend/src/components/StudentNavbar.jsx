import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import Container from "./Container";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

const tabClass = (isActive) =>
  [
    "inline-flex items-center justify-center h-10 w-32 rounded-full text-sm font-medium",
    "transition-all duration-150 select-none",
    isActive
      ? "bg-blue-600 text-white shadow"
      : "text-gray-700 bg-transparent hover:bg-gray-100",
  ].join(" ");

export default function StudentNavbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const name = user?.name || "Mahasiswa";
  const role = user?.role === "student" ? "Mahasiswa" : user?.role;

  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // ================= LOGOUT =================
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
    <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur-md border-b shadow-sm">
      <Container className="py-3">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-6">
            <button
              className="md:hidden grid h-9 w-9 place-items-center rounded-lg border hover:bg-gray-50"
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>

            <div className="text-sm font-bold text-gray-900 tracking-wide">
              EMIS-Vote
            </div>

            {/* DESKTOP TABS */}
            <nav className="hidden md:flex items-center gap-3">
              <NavLink to="/student" end className={({ isActive }) => tabClass(isActive)}>
                My Events
              </NavLink>
              <NavLink to="/student/voting" className={({ isActive }) => tabClass(isActive)}>
                Voting
              </NavLink>
              <NavLink to="/student/profile" className={({ isActive }) => tabClass(isActive)}>
                Profile
              </NavLink>
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* PROFILE (NON CLICKABLE) */}
            <div className="hidden sm:flex items-center gap-2 cursor-default">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {initials}
              </div>

              <div className="leading-tight">
                <div className="text-sm font-semibold text-gray-900">
                  {name}
                </div>
                <div className="text-[11px] text-gray-500">{role}</div>
              </div>
            </div>

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                         text-red-600 hover:bg-red-50 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="mt-3 flex flex-col gap-2 md:hidden">
            <NavLink to="/student" end className={({ isActive }) => tabClass(isActive)} onClick={() => setOpen(false)}>
              My Events
            </NavLink>
            <NavLink to="/student/voting" className={({ isActive }) => tabClass(isActive)} onClick={() => setOpen(false)}>
              Voting
            </NavLink>
            <NavLink to="/student/profile" className={({ isActive }) => tabClass(isActive)} onClick={() => setOpen(false)}>
              Profile
            </NavLink>
          </div>
        )}
      </Container>
    </header>
  );
}

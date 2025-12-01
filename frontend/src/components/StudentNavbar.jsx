import { NavLink, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import Container from "./Container";
import { AuthContext } from "../context/AuthContext";

const tabClass = (isActive) =>
  [
    "inline-flex items-center justify-center h-10 w-32 rounded-full text-sm font-medium",
    "transition-all duration-150 select-none",
    isActive
      ? "bg-blue-600 text-white shadow"
      : "text-gray-700 bg-transparent hover:bg-gray-100",
  ].join(" ");

export default function StudentNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const name = user?.name || "Mahasiswa";
  const role = user?.role === "student" ? "Mahasiswa" : user?.role;

  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    window.location.href = "/login";
  };

  return (
    <>
      <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur-md border-b shadow-sm">
        <Container className="py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Brand + Tabs */}
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

              {/* Desktop Tabs */}
              <nav className="hidden md:flex items-center gap-3">
                <NavLink
                  to="/student"
                  end
                  className={({ isActive }) => tabClass(isActive)}
                >
                  My Events
                </NavLink>
                <NavLink
                  to="/student/voting"
                  className={({ isActive }) => tabClass(isActive)}
                >
                  Voting
                </NavLink>
                <NavLink
                  to="/student/profile"
                  className={({ isActive }) => tabClass(isActive)}
                >
                  Profile
                </NavLink>
              </nav>
            </div>

            {/* Profile kanan */}
            <div className="flex items-center gap-4">
              <div
                className="hidden sm:flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/student/profile")}
              >
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

              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {open && (
            <div className="mt-3 flex flex-col gap-2 md:hidden">
              <NavLink
                to="/student"
                end
                className={({ isActive }) => tabClass(isActive)}
                onClick={() => setOpen(false)}
              >
                My Events
              </NavLink>

              <NavLink
                to="/student/voting"
                className={({ isActive }) => tabClass(isActive)}
                onClick={() => setOpen(false)}
              >
                Voting
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
      </header>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />

          <div className="relative bg-white w-80 rounded-2xl shadow-lg p-6 text-center animate-scaleIn">
            <h3 className="text-lg font-semibold">Logout Akun?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Apakah kamu yakin ingin keluar?
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 border rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                onClick={confirmLogout}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

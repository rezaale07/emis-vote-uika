import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  // 🚨 Jika bukan admin, jangan tampilkan sidebar
  if (!user || user.role !== "admin") return null;

  const menu = [
    { label: "Dashboard", to: "/admin", icon: "📊" },
    { label: "Manage Events", to: "/admin/events", icon: "📅" },
    { label: "Manage Voting", to: "/admin/voting", icon: "🗳️" },
    { label: "Manage Students", to: "/admin/students", icon: "🎓" },
  ];

  const confirmLogout = () => {
    Swal.fire({
      title: "Keluar dari akun?",
      text: "Anda akan logout dari dashboard admin.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) logout();
    });
  };

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-slate-800">Admin Panel</h1>
        <button
          onClick={() => setOpen(true)}
          className="text-xl"
        >
          ☰
        </button>
      </div>

      {/* ================= OVERLAY MOBILE ================= */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-screen w-64 bg-white border-r border-slate-200
          flex flex-col p-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* LOGO / TITLE */}
        <div className="mb-10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">
              E
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900">
                EMIS-Vote
              </h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={confirmLogout}
          className="mt-6 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition font-semibold"
        >
          Logout
        </button>
      </aside>
    </>
  );
}

import { NavLink } from "react-router-dom";
import { useContext } from "react";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  // 🚨 Jika bukan admin, jangan tampilkan sidebar
  if (!user || user.role !== "admin") return null;

  const menu = [
    { label: "Dashboard", to: "/admin" },
    { label: "Manage Events", to: "/admin/events" },
    { label: "Manage Voting", to: "/admin/voting" },
    { label: "Manage Students", to: "/admin/students" },
  ];

  const confirmLogout = () => {
    Swal.fire({
      title: "Keluar dari akun?",
      text: "Anda akan logout dari dashboard admin.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then(res => res.isConfirmed && logout());
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 p-6 flex flex-col z-40">
      <h1 className="text-xl font-semibold mb-8 text-slate-800">Admin</h1>

      <nav className="flex-1 space-y-1">
        {menu.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              isActive
                ? "block px-4 py-2.5 rounded-lg bg-blue-600 text-white shadow-sm"
                : "block px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={confirmLogout}
        className="mt-auto bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition font-medium"
      >
        Logout
      </button>
    </aside>
  );
}

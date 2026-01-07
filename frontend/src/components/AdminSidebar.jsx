import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useContext(AuthContext);

  const menu = [
    { label: "Dashboard", to: "/admin", icon: "📊" },
    { label: "Manage Events", to: "/admin/events", icon: "📅" },
    { label: "Manage Voting", to: "/admin/voting", icon: "🗳️" },
    { label: "Manage Students", to: "/admin/students", icon: "🎓" },
  ];

  const confirmLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Anda akan keluar dari dashboard admin",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    }).then((r) => r.isConfirmed && logout());
  };

  return (
    <>
      {/* overlay mobile */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white border-r
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold text-gray-900">EMIS-Vote</h1>
          <p className="text-xs text-gray-500">Admin Dashboard</p>
        </div>

        <nav className="p-4 space-y-1">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <span>{m.icon}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={confirmLogout}
            className="w-full py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

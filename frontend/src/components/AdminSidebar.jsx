import { NavLink } from "react-router-dom";
import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useContext(AuthContext);

  const menu = useMemo(
    () => [
      { label: "Dashboard", to: "/admin", icon: "📊" },
      { label: "Manage Events", to: "/admin/events", icon: "📅" },
      { label: "Manage Voting", to: "/admin/voting", icon: "🗳️" },
      { label: "Manage Students", to: "/admin/students", icon: "🎓" },
    ],
    []
  );

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
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r",
          "flex flex-col",
          "transform transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          "shadow-xl md:shadow-none",
        ].join(" ")}
        aria-label="Admin Sidebar"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                EMIS-Vote
              </h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>

            {/* Close button (mobile) */}
            <button
              onClick={onClose}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-gray-100 text-gray-600"
              aria-label="Tutup sidebar"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === "/admin"}
              onClick={() => {
                if (open) onClose?.();
              }}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition",
                  "focus:outline-none focus:ring-2 focus:ring-blue-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")
              }
            >
              {/* Icon wrapper: jangan pakai isActive di luar callback */}
              <span
                className={[
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  "bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition",
                  // kalau active, navlink sudah jadi putih, icon tetap aman
                  "group-[.active]:bg-white/20 group-[.active]:text-white",
                ].join(" ")}
                aria-hidden
              >
                {m.icon}
              </span>

              <span className="truncate">{m.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={confirmLogout}
            className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-red-200"
            type="button"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

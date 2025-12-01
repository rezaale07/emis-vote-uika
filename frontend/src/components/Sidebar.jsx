import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const linkStyle = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white shadow"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const confirmLogout = () => {
    logout(); // context handle localStorage + redirect
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r h-screen flex flex-col justify-between">

        {/* MENU ATAS */}
        <div>
          <div className="px-4 py-4 text-lg font-semibold text-gray-800">
            Admin
          </div>

          <nav className="px-2 space-y-1">
            <NavLink to="/admin" end className={linkStyle}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/events" className={linkStyle}>
              Manage Events
            </NavLink>
            <NavLink to="/admin/voting" className={linkStyle}>
              Manage Voting
            </NavLink>
            <NavLink to="/admin/students" className={linkStyle}>
              Manage Students
            </NavLink>
            <NavLink to="/admin/results" className={linkStyle}>
              Reports
            </NavLink>
          </nav>
        </div>

        {/* BUTTON LOGOUT DI BAWAH */}
        <div className="p-3 border-t">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition"
          >
            Logout
          </button>
        </div>

      </aside>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* MODAL BOX */}
          <div className="relative bg-white w-80 rounded-2xl shadow-xl p-6 text-center animate-scaleIn">
            <h3 className="text-lg font-semibold text-gray-800">
              Logout Admin?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Apakah kamu yakin ingin keluar dari panel admin?
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-xl border hover:bg-gray-50 transition"
              >
                Batal
              </button>

              <button
                onClick={confirmLogout}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn .2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn .25s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

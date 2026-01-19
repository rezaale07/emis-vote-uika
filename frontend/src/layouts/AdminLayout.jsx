import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminLayout({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // auto-close sidebar setelah pindah route (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex">
        {/* spacer untuk sidebar desktop */}
        <div className="hidden md:block md:w-64 shrink-0" />

        <div className="min-w-0 flex-1 flex flex-col">
          <AdminNavbar
            title={title}
            subtitle={subtitle}
            onMenu={() => setOpen(true)}
          />

          <main className="w-full">
            {/* ✅ samakan dengan dashboard lama: max-w-7xl */}
            <div className="mx-auto w-full max-w-7xl px-4 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminLayout({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      {/* MAIN */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <AdminNavbar title={title} onMenu={() => setOpen(true)} />

        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

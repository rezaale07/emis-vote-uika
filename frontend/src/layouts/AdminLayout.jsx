// layouts/AdminLayout.jsx
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
      {/* Sidebar tetap fixed */}
      <Sidebar />

      {/* Navbar */}
      <Navbar title={title} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

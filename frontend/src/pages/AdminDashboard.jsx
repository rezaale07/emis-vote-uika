import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [events, setEvents] = useState(0);
  const [students, setStudents] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    // Ambil total event
    api.get("/events").then((res) => setEvents(res.data.length));

    // Ambil total mahasiswa
    api.get("/students").then((res) => setStudents(res.data.length));

    // Ambil total vote
    api.get("/votings").then((res) => {
      let total = 0;
      res.data.forEach((v) => {
        if (v.options) {
          total += v.options.reduce((sum, o) => sum + (o.votes_count || 0), 0);
        }
      });
      setTotalVotes(total);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Admin Dashboard" />

      <div className="mx-auto max-w-7xl w-full px-4 py-6 grid md:grid-cols-[16rem_1fr] gap-6">
        
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* MAIN */}
        <main>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistik Sistem</h2>

          {/* STATISTICS */}
          <div className="grid sm:grid-cols-3 gap-5">
            <Stat label="Total Events" value={events} />
            <Stat label="Total Mahasiswa" value={students} />
            <Stat label="Total Votes Masuk" value={totalVotes} />
          </div>

          {/* CHART PLACEHOLDER */}
          <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800">Grafik Aktivitas Voting</h3>
            <div className="mt-4 h-60 grid place-items-center rounded-xl border bg-gray-50 text-gray-500">
              Grafik akan ditambahkan di tahap berikutnya 📊
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentNavbar from "../components/StudentNavbar";
import Badge from "../components/Badge";
import EventCard from "../components/EventCard";
import Container from "../components/Container";
import { getEvents } from "../services/api";
import EventCardSkeleton from "../components/EventCardSkeleton";

const heroVoting = {
  title: "Pemilihan Ketua BEM 2025",
  subtitle: "Pemilihan Ketua Badan Eksekutif Mahasiswa periode 2025–2026",
};

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIX: ambil nama dari objek user
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const name = storedUser?.name?.split(" ")[0] || "Mahasiswa";

  useEffect(() => {
    getEvents()
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Gagal mengambil event:", err))
      .finally(() => setLoading(false));
  }, []);

  const getStatus = (evDate) => {
    const today = new Date();
    const eventDate = new Date(evDate);
    return eventDate > today ? "upcoming" : "ongoing";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <Container className="py-6">
        {/* HEADER */}
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang, {name}! 👋
          </h1>
          <p className="text-gray-600">
            Jelajahi event kampus dan ikuti voting yang sedang berlangsung
          </p>
        </header>

        {/* HERO */}
        <section className="mt-5 overflow-hidden rounded-2xl bg-blue-600 text-white shadow-lg">
          <div className="relative p-6 sm:p-8">
            <div className="md:w-3/4">
              <p className="text-sm opacity-90">Voting Aktif</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-semibold">
                {heroVoting.title}
              </h2>
              <p className="opacity-95">{heroVoting.subtitle}</p>

              <Link
                to="/student/voting"
                className="btn-anim mt-4 inline-block rounded-xl bg-white/95 px-4 py-2 text-blue-700 font-medium shadow hover:bg-white transition"
              >
                Vote Sekarang
              </Link>
            </div>

            <div className="absolute right-6 bottom-6 hidden sm:block opacity-80">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white/10 border border-white/30 backdrop-blur-sm">
                <span className="text-4xl">🗳️</span>
              </div>
            </div>
          </div>
        </section>

        {/* EVENT LIST */}
        <section className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Events
              </h3>
              <p className="text-sm text-gray-600">
                Event yang akan datang dan sedang berlangsung
              </p>
            </div>

            <div className="sm:self-start">
              <Badge color="blue">Upcoming</Badge>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-gray-500 mt-4">Belum ada event.</p>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <EventCard
                  key={ev.id}
                  id={ev.id}
                  img={ev.poster_url || "/default-event.jpg"}
                  title={ev.title}
                  desc={ev.description}
                  date={ev.date}
                  time="–"
                  quota="–"
                  status={getStatus(ev.date)}
                />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-10 border-t pt-4 text-center text-xs text-gray-500">
          Powered by UIKA IT Division
        </footer>
      </Container>
    </div>
  );
}

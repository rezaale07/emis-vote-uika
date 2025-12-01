import { useEffect, useState } from "react";
import { getVotings } from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Container from "../components/Container";
import { useNavigate } from "react-router-dom";

export default function StudentVoting() {
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load semua voting
  useEffect(() => {
    getVotings()
      .then((res) => setVotings(res.data || []))
      .catch((err) => console.error("Gagal load votings:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-center space-y-3">
          <div className="w-56 h-6 bg-slate-300 rounded mx-auto" />
          <div className="w-40 h-6 bg-slate-200 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />

      <Container className="py-8 md:py-10">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-500 uppercase">
            EMIS-Vote UIKA
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
            Voting Kampus
          </h1>
          <p className="mt-2 text-slate-600 max-w-xl text-sm md:text-base">
            Pilih voting yang ingin Anda ikuti, lalu tentukan kandidat pilihan
            Anda dengan satu kali klik.
          </p>
        </div>

        {/* Kalau tidak ada voting */}
        {votings.length === 0 && (
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-dashed border-slate-200 p-8 text-center text-slate-500">
            <p className="font-medium mb-1">Belum ada voting aktif</p>
            <p className="text-sm">
              Silakan cek kembali nanti atau hubungi panitia kampus.
            </p>
          </div>
        )}

        {/* LIST VOTING */}
        <div className="space-y-6">
          {votings.map((v) => {
            const isActive = v.status === "active";

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => isActive && navigate(`/student/voting/${v.id}`)}
                className={[
                  "w-full text-left bg-white rounded-2xl shadow-sm border p-5 md:p-7",
                  "flex flex-col gap-4 md:flex-row md:items-center justify-between",
                  "transition-all duration-200",
                  isActive
                    ? "hover:shadow-xl hover:-translate-y-[2px] border-transparent cursor-pointer"
                    : "opacity-60 cursor-not-allowed border-slate-200",
                ].join(" ")}
              >
                {/* Left: Poster + Info */}
                <div className="flex items-start gap-4">
                  {/* Poster */}
                  {v.poster_url ? (
                    <img
                      src={v.poster_url}
                      alt="poster"
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-md ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium border border-dashed border-slate-200">
                      No Poster
                    </div>
                  )}

                  {/* Info Voting */}
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                      {v.title}
                    </h2>
                    {v.description && (
                      <p className="mt-1 text-xs md:text-sm text-slate-600 line-clamp-2">
                        {v.description}
                      </p>
                    )}

                    {/* Info tanggal (jika ada) */}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] md:text-xs text-slate-500">
                      {v.start_date && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                          Mulai: {v.start_date}
                        </span>
                      )}
                      {v.end_date && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                          Selesai: {v.end_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={[
                      "px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full border",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200",
                    ].join(" ")}
                  >
                    {v.status?.toUpperCase()}
                  </span>

                  {isActive && (
                    <span className="hidden md:inline-flex items-center text-[11px] font-medium text-blue-600">
                      Klik untuk mengikuti voting →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Container>

      <footer className="text-center text-[11px] text-slate-400 border-t py-4 mt-6">
        © UIKA IT Division — All Rights Reserved
      </footer>
    </div>
  );
}

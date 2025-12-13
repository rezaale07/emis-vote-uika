import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { submitVote } from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import Container from "../components/Container";
import Swal from "sweetalert2";

export default function StudentVoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const userId = Number(localStorage.getItem("user_id"));

  // ========================= LOAD DATA =========================
  useEffect(() => {
    setLoading(true);

    api
      .get(`/votings/${id}`)
      .then((res) => {
        const data = res.data;
        setVoting(data);

        // Jika backend mengirim info bahwa user sudah vote
        if (data.has_voted && data.voted_option_id) {
          setSelectedId(data.voted_option_id);
        }
      })
      .catch(() => {
        setVoting(null);
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat",
          text: "Voting tidak ditemukan atau terjadi kesalahan.",
          confirmButtonColor: "#2563eb",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const alreadyVoted =
    Boolean(voting?.has_voted) || Boolean(voting?.voted_option_id);

  const isActive = voting?.status === "active";
  const options = voting?.options || [];

  // ========================= KIRIM SUARA =========================
  const handleVote = async () => {
    if (alreadyVoted) {
      return Swal.fire({
        icon: "info",
        title: "Kamu sudah memilih",
        text: "Kamu sudah memberikan suara untuk voting ini.",
        confirmButtonColor: "#2563eb",
      });
    }

    if (!isActive) {
      return Swal.fire({
        icon: "warning",
        title: "Voting tidak aktif",
        text: "Voting ini sudah tidak aktif. Kamu tidak dapat mengirim suara.",
        confirmButtonColor: "#2563eb",
      });
    }

    if (!selectedId) {
      return Swal.fire({
        icon: "warning",
        title: "Belum memilih kandidat",
        text: "Silakan pilih salah satu kandidat terlebih dahulu.",
        confirmButtonColor: "#2563eb",
      });
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await submitVote({
        voting_id: Number(id),
        vote_option_id: selectedId,
        user_id: userId,
      });

      await Swal.fire({
        icon: "success",
        title: "Suara terkirim",
        text: "Terima kasih, suara kamu berhasil direkam.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(`/student/voting/${id}/results`);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "Gagal mengirim suara.";

      setErrorMsg(msg);

      if (status === 409) {
        // Sudah pernah vote
        await Swal.fire({
          icon: "info",
          title: "Sudah pernah memilih",
          text:
            msg ||
            "Sistem mendeteksi kamu sudah pernah memberikan suara untuk voting ini.",
          confirmButtonColor: "#2563eb",
        });

        navigate(`/student/voting/${id}/results`);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: msg,
          confirmButtonColor: "#2563eb",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ========================= LOADING STATE =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-40 bg-slate-300 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="h-28 bg-slate-200 rounded-2xl" />
              <div className="h-28 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ========================= TIDAK ADA VOTING =========================
  if (!voting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-14 text-center">
          <h1 className="text-xl font-semibold text-slate-800">
            Voting tidak ditemukan
          </h1>
          <button
            onClick={() => navigate("/student/voting")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Kembali ke daftar voting
          </button>
        </Container>
      </div>
    );
  }

  const statusBadgeClass =
    voting.status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : voting.status === "closed"
      ? "bg-red-50 text-red-600 border-red-200"
      : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      <StudentNavbar />

      <Container className="py-8 md:py-10">
        {/* Back */}
        <button
          onClick={() => navigate("/student/voting")}
          className="mb-6 text-xs text-slate-600 hover:text-slate-800"
        >
          ← Kembali ke daftar voting
        </button>

        {/* HEADER VOTING */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {voting.title}
            </h1>
            {voting.description && (
              <p className="text-slate-600 mt-2 text-sm md:text-base">
                {voting.description}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <span
              className={`inline-flex items-center px-3 py-1.5 text-[11px] md:text-xs font-semibold rounded-full border ${statusBadgeClass}`}
            >
              {voting.status?.toUpperCase()}
            </span>

            {alreadyVoted && (
              <span className="text-[11px] md:text-xs font-medium text-blue-600">
                Kamu sudah memberikan suara. Kamu masih bisa melihat pilihanmu
                dan hasil voting.
              </span>
            )}
          </div>
        </div>

        {/* POSTER */}
        {voting.poster_url && (
          <img
            src={voting.poster_url}
            className="w-full rounded-2xl mt-6 shadow border"
            alt="Voting Poster"
          />
        )}

        {/* KANDIDAT */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">
            {alreadyVoted ? "Pilihan Kamu" : "Pilih Kandidat"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {alreadyVoted
              ? "Kamu sudah memilih, namun tetap bisa melihat kembali kandidat yang kamu pilih."
              : isActive
              ? "Klik salah satu kandidat untuk memilih. Kamu hanya bisa memilih satu kandidat."
              : "Voting tidak aktif. Kamu tidak dapat mengirim suara."}
          </p>

          {options.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500 italic">
              Belum ada kandidat untuk voting ini.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 mt-5">
              {options.map((opt) => {
                const isSelected = selectedId === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() =>
                      !alreadyVoted && isActive && setSelectedId(opt.id)
                    }
                    className={[
                      "p-5 rounded-2xl border bg-white shadow-sm transition",
                      alreadyVoted
                        ? "opacity-80 cursor-default"
                        : "cursor-pointer hover:shadow-md hover:-translate-y-[2px]",
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          opt.photo_url ||
                          "https://source.unsplash.com/80x80/?person,face"
                        }
                        alt={opt.name}
                        className="w-14 h-14 rounded-full object-cover border shadow-sm bg-slate-100"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {opt.name}
                        </p>
                        {opt.bio && (
                          <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                            {opt.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <p className="mt-3 text-xs font-medium text-blue-600">
                        ✓ Kandidat terpilih
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM ACTION */}
        <div className="mt-10 pt-5 border-t">
          {errorMsg && (
            <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
          )}

          {alreadyVoted ? (
            <button
              onClick={() => navigate(`/student/voting/${id}/results`)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow"
            >
              Lihat Hasil Voting →
            </button>
          ) : (
            <button
              disabled={!selectedId || submitting || !isActive}
              onClick={handleVote}
              className={[
                "px-6 py-2.5 rounded-xl text-sm font-semibold shadow",
                !selectedId || !isActive || submitting
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700",
              ].join(" ")}
            >
              {submitting ? "Mengirim..." : "Kirim Suara"}
            </button>
          )}
        </div>
      </Container>

      <footer className="text-center text-xs text-slate-400 py-6">
        © UIKA IT Division
      </footer>

      <style>{`
        .fade-in { animation: fadeIn .3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

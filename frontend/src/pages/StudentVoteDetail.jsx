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

        if (data.has_voted && data.voted_option_id) {
          setSelectedId(data.voted_option_id);
        }
      })
      .catch(() => {
        setVoting(null);
        Swal.fire("Error", "Voting tidak ditemukan.", "error");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const alreadyVoted =
    Boolean(voting?.has_voted) || Boolean(voting?.voted_option_id);

  const isActive = voting?.status === "active";
  const events = voting?.options || [];

  // ========================= SUBMIT VOTE =========================
  const handleVote = async () => {
    if (alreadyVoted)
      return Swal.fire("Info", "Kamu sudah memilih.", "info");

    if (!isActive)
      return Swal.fire(
        "Voting tidak aktif",
        "Voting ini sudah ditutup.",
        "warning"
      );

    if (!selectedId)
      return Swal.fire(
        "Belum memilih event",
        "Silakan pilih salah satu event.",
        "warning"
      );

    setSubmitting(true);
    setErrorMsg("");

    try {
      await submitVote({
        voting_id: Number(id),
        vote_option_id: selectedId,
        user_id: userId,
      });

      Swal.fire({
        icon: "success",
        title: "Suara terkirim",
        timer: 1400,
        showConfirmButton: false,
      });

      navigate(`/student/voting/${id}/results`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mengirim suara.";
      setErrorMsg(msg);

      Swal.fire("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================= LOADING =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-10 animate-pulse space-y-5">
          <div className="h-6 w-56 bg-slate-200 rounded" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
          </div>
        </Container>
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentNavbar />
        <Container className="py-14 text-center">
          <h1 className="text-xl font-semibold">Voting tidak ditemukan</h1>
          <button
            onClick={() => navigate("/student/voting")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Kembali
          </button>
        </Container>
      </div>
    );
  }

  const statusBadge =
    voting.status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-600 border-red-200";

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      <StudentNavbar />

      <Container className="py-8">
        <button
          onClick={() => navigate("/student/voting")}
          className="mb-6 text-xs text-slate-600 hover:text-slate-800"
        >
          ← Kembali
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{voting.title}</h1>
            {voting.description && (
              <p className="text-slate-600 mt-2">{voting.description}</p>
            )}
          </div>

          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${statusBadge}`}
          >
            {voting.status.toUpperCase()}
          </span>
        </div>

        {/* POSTER */}
        {voting.poster_url && (
          <img
            src={voting.poster_url}
            className="w-full rounded-2xl mt-6 border shadow"
          />
        )}

        {/* EVENTS */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">
            {alreadyVoted ? "Event Pilihan Kamu" : "Pilih Event"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {alreadyVoted
              ? "Kamu sudah memilih event."
              : "Pilih satu event yang ingin kamu dukung."}
          </p>

          {events.length === 0 ? (
            <p className="mt-4 italic text-slate-500">
              Belum ada event tersedia.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 mt-5">
              {events.map((ev) => {
                const isSelected = selectedId === ev.id;

                return (
                  <div
                    key={ev.id}
                    onClick={() =>
                      !alreadyVoted && isActive && setSelectedId(ev.id)
                    }
                    className={[
                      "p-5 rounded-2xl border bg-white shadow-sm transition",
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200",
                      alreadyVoted
                        ? "cursor-default opacity-80"
                        : "cursor-pointer hover:shadow-md",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          ev.photo_url ||
                          "https://source.unsplash.com/80x80/?event"
                        }
                        className="w-14 h-14 rounded-xl object-cover border"
                      />
                      <div>
                        <p className="font-semibold">{ev.name}</p>
                        {ev.bio && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {ev.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <p className="mt-3 text-xs font-medium text-blue-600">
                        ✓ Event terpilih
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTION */}
        <div className="mt-10 pt-5 border-t">
          {errorMsg && (
            <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
          )}

          {alreadyVoted ? (
            <button
              onClick={() => navigate(`/student/voting/${id}/results`)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold"
            >
              Lihat Hasil Voting →
            </button>
          ) : (
            <button
              disabled={!selectedId || submitting || !isActive}
              onClick={handleVote}
              className={`px-6 py-2.5 rounded-xl font-semibold ${
                !selectedId || !isActive || submitting
                  ? "bg-slate-200 text-slate-500"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {submitting ? "Mengirim..." : "Kirim Suara"}
            </button>
          )}
        </div>
      </Container>

      <footer className="text-center text-xs text-slate-400 py-6">
        © UIKA IT Division
      </footer>
    </div>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// AUTH
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";

// ADMIN
import AdminDashboard from "./pages/AdminDashboard";
import ManageEvents from "./pages/ManageEvents";
import ManageVoting from "./pages/ManageVoting";
import ManageStudents from "./pages/ManageStudents";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import AddVoting from "./pages/AddVoting";
import EditVoting from "./pages/EditVoting";
import VotingResults from "./pages/VotingResults";
import AdminEventParticipants from "./pages/AdminEventParticipants";

// EVENT VOTE (ADMIN)
import ManageEventVote from "./pages/ManageEventVote";
import AddEventVote from "./pages/AddEventVote";
import EditEventVote from "./pages/EditEventVote";

// STUDENT
import StudentDashboard from "./pages/StudentDashboard";
import StudentVoting from "./pages/StudentVoting";
import StudentVoteDetail from "./pages/StudentVoteDetail";
import VotingResultsStudent from "./pages/VotingResultsStudent";
import StudentProfile from "./pages/StudentProfile";
import EventDetails from "./pages/EventDetails";
import EventParticipants from "./pages/EventParticipants";
import Timeline from "./pages/Timeline";

/* =======================
   ROUTE GUARDS
======================= */
const RequireRole = ({ role, children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? children : <Navigate to="/login" replace />;
};

const RedirectIfAuthed = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return children;
  return user.role === "admin"
    ? <Navigate to="/admin" replace />
    : <Navigate to="/student/events" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* ========= LANDING PAGE ========= */}
      <Route path="/" element={<Welcome />} />

      {/* ========= LOGIN ========= */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        }
      />

      {/* ================= ADMIN ================= */}
      <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
      <Route path="/admin/events" element={<RequireRole role="admin"><ManageEvents /></RequireRole>} />
      <Route path="/admin/events/add" element={<RequireRole role="admin"><AddEvent /></RequireRole>} />
      <Route path="/admin/events/:id/edit" element={<RequireRole role="admin"><EditEvent /></RequireRole>} />
      <Route path="/admin/events/:id/participants" element={<RequireRole role="admin"><AdminEventParticipants /></RequireRole>} />

      <Route path="/admin/voting" element={<RequireRole role="admin"><ManageVoting /></RequireRole>} />
      <Route path="/admin/voting/add" element={<RequireRole role="admin"><AddVoting /></RequireRole>} />
      <Route path="/admin/voting/:id/edit" element={<RequireRole role="admin"><EditVoting /></RequireRole>} />
      <Route path="/admin/results/:id" element={<RequireRole role="admin"><VotingResults /></RequireRole>} />

      <Route path="/admin/voting/:id/event-vote" element={<RequireRole role="admin"><ManageEventVote /></RequireRole>} />
      <Route path="/admin/voting/:id/event-vote/add" element={<RequireRole role="admin"><AddEventVote /></RequireRole>} />
      <Route path="/admin/voting/:id/event-vote/:optionId/edit" element={<RequireRole role="admin"><EditEventVote /></RequireRole>} />

      <Route path="/admin/students" element={<RequireRole role="admin"><ManageStudents /></RequireRole>} />

      {/* ================= STUDENT ================= */}
      <Route path="/student" element={<Navigate to="/student/events" replace />} />
      <Route path="/student/events" element={<RequireRole role="student"><StudentDashboard /></RequireRole>} />
      <Route path="/student/voting" element={<RequireRole role="student"><StudentVoting /></RequireRole>} />
      <Route path="/student/voting/:id" element={<RequireRole role="student"><StudentVoteDetail /></RequireRole>} />
      <Route path="/student/voting/:id/results" element={<RequireRole role="student"><VotingResultsStudent /></RequireRole>} />
      <Route path="/student/profile" element={<RequireRole role="student"><StudentProfile /></RequireRole>} />

      <Route path="/event/:id" element={<RequireRole role="student"><EventDetails /></RequireRole>} />
      <Route path="/event/:id/participants" element={<RequireRole role="student"><EventParticipants /></RequireRole>} />

      {/* ========= TIMELINE (TETAP) ========= */}
      <Route path="/timeline" element={<RequireRole role="student"><Timeline /></RequireRole>} />

      {/* ========= FALLBACK ========= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

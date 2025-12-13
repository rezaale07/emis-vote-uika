import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ManageEvents from "./pages/ManageEvents";
import ManageVoting from "./pages/ManageVoting";
import VotingResults from "./pages/VotingResults";
import EventDetails from "./pages/EventDetails";
import StudentVoting from "./pages/StudentVoting";
import VotingResultsStudent from "./pages/VotingResultsStudent";
import ManageStudents from "./pages/ManageStudents";
import AdminEventParticipants from "./pages/AdminEventParticipants";
import EventParticipants from "./pages/EventParticipants";
import StudentProfile from "./pages/StudentProfile";
import AddEvent from "./pages/AddEvent";
import AddVoting from "./pages/AddVoting";
import ManageCandidates from "./pages/ManageCandidates";
import AddCandidate from "./pages/AddCandidate";
import EditCandidate from "./pages/EditCandidate";
import EditVoting from "./pages/EditVoting";
import StudentVoteDetail from "./pages/StudentVoteDetail";
import EditEvent from "./pages/EditEvent";

// =======================
// GUARDS
// =======================
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
    : <Navigate to="/student" replace />;
};

export default function App() {
  return (
    <Routes>

      {/* ROOT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        }
      />

      {/* ========================= ADMIN ========================= */}

      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminDashboard />
          </RequireRole>
        }
      />

      {/* EVENTS */}
      <Route
        path="/admin/events"
        element={<RequireRole role="admin"><ManageEvents /></RequireRole>}
      />

      <Route
        path="/admin/events/add"
        element={<RequireRole role="admin"><AddEvent /></RequireRole>}
      />

      <Route
        path="/admin/events/:id/participants"
        element={<RequireRole role="admin"><AdminEventParticipants /></RequireRole>}
      />

      <Route
        path="/admin/events/:id/edit"
        element={<RequireRole role="admin"><EditEvent /></RequireRole>}
      />

      {/* ========================= VOTING ========================= */}

      <Route
        path="/admin/voting"
        element={<RequireRole role="admin"><ManageVoting /></RequireRole>}
      />

      <Route
        path="/admin/voting/add"
        element={<RequireRole role="admin"><AddVoting /></RequireRole>}
      />

      <Route
        path="/admin/voting/:id/edit"
        element={<RequireRole role="admin"><EditVoting /></RequireRole>}
      />

      {/* CANDIDATES */}
      <Route
        path="/admin/voting/:id/candidates"
        element={<RequireRole role="admin"><ManageCandidates /></RequireRole>}
      />

      <Route
        path="/admin/voting/:id/candidates/add"
        element={<RequireRole role="admin"><AddCandidate /></RequireRole>}
      />

      <Route
        path="/admin/voting/:id/candidates/:cid/edit"
        element={<RequireRole role="admin"><EditCandidate /></RequireRole>}
      />

      {/* RESULTS (FIXED!) */}
      <Route
        path="/admin/results/:id"
        element={<RequireRole role="admin"><VotingResults /></RequireRole>}
      />

      {/* STUDENTS CRUD */}
      <Route
        path="/admin/students"
        element={<RequireRole role="admin"><ManageStudents /></RequireRole>}
      />

      {/* ========================= STUDENT ========================= */}

      <Route
        path="/student"
        element={<RequireRole role="student"><StudentDashboard /></RequireRole>}
      />

      <Route
        path="/student/profile"
        element={<RequireRole role="student"><StudentProfile /></RequireRole>}
      />

      <Route
        path="/student/voting"
        element={<RequireRole role="student"><StudentVoting /></RequireRole>}
      />

      <Route
        path="/student/voting/:id"
        element={<RequireRole role="student"><StudentVoteDetail /></RequireRole>}
      />

      <Route
        path="/student/voting/:id/results"
        element={<RequireRole role="student"><VotingResultsStudent /></RequireRole>}
      />

      <Route
        path="/event/:id"
        element={<RequireRole role="student"><EventDetails /></RequireRole>}
      />

      <Route
        path="/event/:id/participants"
        element={<RequireRole role="student"><EventParticipants /></RequireRole>}
      />

      {/* NOT FOUND */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

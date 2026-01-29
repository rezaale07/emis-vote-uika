import axios from "axios";

// ========================
// 🔧 AXIOS INSTANCE
// ========================
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ========================
// 🔐 AUTO TOKEN (SANCTUM)
// ========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================
// 🔐 AUTH
// ========================
export const loginUser = (payload) =>
  api.post("/login", payload);

// 🔥 FIX FINAL
export const forgotPassword = (payload) =>
  api.post("/forgot-password", {
    login: payload.login,
  });

// 🔥 FIX FINAL
export const resetPassword = (payload) =>
  api.post("/reset-password", payload);

// ========================
// 🎪 EVENTS
// ========================
export const getEvents = () => api.get("/events");
export const getEventById = (id) => api.get(`/events/${id}`);

export const createEvent = (payload) =>
  api.post("/events", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateEvent = (id, payload) =>
  api.post(`/events/${id}?_method=PUT`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteEvent = (id) =>
  api.delete(`/events/${id}`);

export const getEventParticipants = (id) =>
  api.get(`/events/${id}/participants`);

// ========================
// 📋 REGISTRATIONS
// ========================
export const registerEvent = (payload) =>
  api.post("/registrations", payload);

export const checkRegistration = (event_id, user_id) =>
  api.get("/registrations/check", {
    params: { event_id, user_id },
  });

// ========================
// 🗳️ VOTING
// ========================
export const getVotings = () => api.get("/votings");
export const getVotingById = (id) => api.get(`/votings/${id}`);

export const createVoting = (payload) =>
  api.post("/votings", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateVoting = (id, payload) =>
  api.post(`/votings/${id}?_method=PUT`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteVoting = (id) =>
  api.delete(`/votings/${id}`);

// ========================
// ✅ CEK USER SUDAH VOTE
// ========================
export const checkUserVote = (voting_id, user_id) =>
  api.get("/votes/check", {
    params: { voting_id, user_id },
  });

// ========================
// 🧩 VOTE OPTIONS
// ========================
export const getVoteOptions = (votingId) =>
  api.get(`/votings/${votingId}/options`);

export const createVoteOption = (votingId, payload) =>
  api.post(`/votings/${votingId}/options`, payload);

export const updateVoteOption = (votingId, optionId, payload) =>
  api.put(`/votings/${votingId}/options/${optionId}`, payload);

export const deleteVoteOption = (votingId, optionId) =>
  api.delete(`/votings/${votingId}/options/${optionId}`);

// ========================
// 🗳️ SUBMIT VOTE
// ========================
export const submitVote = (payload) =>
  api.post("/votes", payload);

// ========================
// 🎓 STUDENTS CRUD
// ========================
export const getStudents = () => api.get("/students");
export const getStudentById = (id) => api.get(`/students/${id}`);
export const createStudent = (payload) => api.post("/students", payload);
export const updateStudent = (id, payload) =>
  api.put(`/students/${id}`, payload);
export const deleteStudent = (id) =>
  api.delete(`/students/${id}`);

export default api;

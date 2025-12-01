import axios from "axios";

// ========================
// 🔧 SETUP AXIOS CLIENT
// ========================
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: false,
});

// Token auto inject
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========================
// 🔐 AUTH
// ========================
export const loginUser = (payload) => api.post("/login", payload);

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
  api.put(`/events/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteEvent = (id) => api.delete(`/events/${id}`);

export const getEventParticipants = (id) =>
  api.get(`/events/${id}/participants`);

// ========================
// 📋 REGISTRATIONS
// ========================
export const registerEvent = (payload) => api.post("/registrations", payload);

export const checkRegistration = (event_id, user_id) =>
  api.get("/registrations/check", { params: { event_id, user_id } });

// 🗳️ VOTING
export const getVotings = () => api.get("/votings");
export const getVotingById = (id) => api.get(`/votings/${id}`);

export const createVoting = (payload) =>
  api.post("/votings", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// pakai POST + _method=PUT agar FormData aman di Laravel
export const updateVoting = (id, payload) =>
  api.post(`/votings/${id}?_method=PUT`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteVoting = (id) => api.delete(`/votings/${id}`);


// Voting Options
export const getVoteOptions = (votingId) =>
  api.get(`/votings/${votingId}/options`);

export const createVoteOption = (votingId, payload) =>
  api.post(`/votings/${votingId}/options`, payload);

export const updateVoteOption = (votingId, optionId, payload) =>
  api.put(`/votings/${votingId}/options/${optionId}`, payload);

export const deleteVoteOption = (votingId, optionId) =>
  api.delete(`/votings/${votingId}/options/${optionId}`);


// Voting Submit
export const submitVote = (payload) =>
  api.post("/votes", payload).catch((err) => { throw err });


// ========================
// 🎓 STUDENTS CRUD
// ========================
export const getStudents = () => api.get("/students");
export const createStudent = (payload) => api.post("/students", payload);
export const updateStudent = (id, payload) =>
  api.put(`/students/${id}`, payload);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getStudentById = (id) => api.get(`/students/${id}`);

export default api;

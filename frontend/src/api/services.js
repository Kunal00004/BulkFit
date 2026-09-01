import api from "./axios";

// ---------- Auth ----------
export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
};

// ---------- User ----------
export const userApi = {
  getMe: () => api.get("/users/me"),
  updateWeight: (currentWeightKg) => api.patch("/users/me/weight", { currentWeightKg }),
};

// ---------- Dashboard ----------
export const dashboardApi = {
  getDashboard: () => api.get("/dashboard"),
};

// ---------- Diet ----------
export const dietApi = {
  searchFoods: (query = "") => api.get("/foods", { params: { query } }),
  logFood: (payload) => api.post("/diet/logs", payload),
  getSummary: (date) => api.get("/diet/summary", { params: date ? { date } : {} }),
  deleteLog: (id) => api.delete(`/diet/logs/${id}`),
  findOrCreateFood: (foodData) => api.post("/foods/find-or-create", foodData), 
};

// ---------- Workout ----------
export const workoutApi = {
  getExercises: () => api.get("/exercises"),
  logWorkout: (payload) => api.post("/workout/logs", payload),
  logWorkoutBatch: (payloadArray) => api.post("/workout/logs/batch", payloadArray),
  getRecent: (limit = 5) => api.get("/workout/logs/recent", { params: { limit } }),
  deleteLog: (id) => api.delete(`/workout/logs/${id}`),
};

// -----------AI API Services---------------
export const aiApi = {
  scanFood: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/ai/scan-food", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  generatePlan: (data) => api.post("/ai/generate-plan", data),
  
  getMyPlan: () => api.get("/ai/my-plan"),
  deleteMyPlan: () => api.delete("/ai/my-plan"),
};
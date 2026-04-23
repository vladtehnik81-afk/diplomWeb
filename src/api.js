const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Ошибка сервера" }));
    throw new Error(err.detail || `Ошибка ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Список вузов
  getUniversities({ city = "", direction = "", search = "", sortBy = "rating" } = {}) {
    const p = new URLSearchParams();
    if (city)      p.set("city",      city);
    if (direction) p.set("direction", direction);
    if (search)    p.set("search",    search);
    if (sortBy)    p.set("sort_by",   sortBy);
    return request(`/universities?${p}`);
  },

  getUniversity(id)    { return request(`/universities/${id}`); },
  getScores(id)        { return request(`/universities/${id}/scores`); },
  getPhoto(id)         { return request(`/universities/${id}/photo`); },

  search({ total, formType = "all", city = "", direction = "", sortBy = "match" } = {}) {
    const p = new URLSearchParams();
    p.set("total",     total);
    p.set("form_type", formType);
    if (city)      p.set("city",      city);
    if (direction) p.set("direction", direction);
    if (sortBy)    p.set("sort_by",   sortBy);
    return request(`/search?${p}`);
  },

  getCities()     { return request("/cities");     },
  getDirections() { return request("/directions"); },
  getStats()      { return request("/stats");      },

  // Авторизация
  register(name, email, password) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getMe() { return request("/me"); },

  // Избранное
  getFavorites()      { return request("/favorites"); },
  getFavoriteIds()    { return request("/favorites/ids"); },

  addFavorite(id) {
    return request(`/favorites/${id}`, { method: "POST" });
  },

  removeFavorite(id) {
    return request(`/favorites/${id}`, { method: "DELETE" });
  },
};
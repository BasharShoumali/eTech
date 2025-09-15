// http.js
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

let token = null;

// small safe storage wrapper
const storage = {
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (err) {
      if (import.meta.env.DEV) console.debug("storage.set failed", err);
    }
  },
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch (err) {
      if (import.meta.env.DEV) console.debug("storage.get failed", err);
      return null;
    }
  },
  remove(k) {
    try {
      localStorage.removeItem(k);
    } catch (err) {
      if (import.meta.env.DEV) console.debug("storage.remove failed", err);
    }
  },
};

export function setAuthToken(t) {
  token = t;
  storage.set("authToken", t);
}
export function loadAuthToken() {
  token = storage.get("authToken");
  return token;
}
export function clearAuthToken() {
  token = null;
  storage.remove("authToken");
}

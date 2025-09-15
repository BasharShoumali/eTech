// client/src/api/http.js
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

let token = null;

// safe storage wrapper (no empty catches)
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

async function request(
  path,
  { method = "GET", data, headers = {}, params } = {}
) {
  const url = new URL(
    String(path).startsWith("http") ? path : BASE_URL + path,
    window.location.origin
  );
  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      ...(data != null ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: data != null ? JSON.stringify(data) : undefined,
  });

  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (body && (body.error || body.message)) ||
      `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    err.url = url.toString();
    throw err;
  }
  return body;
}

export const http = {
  get: (p, opt) => request(p, { ...opt, method: "GET" }),
  post: (p, data, opt = {}) => request(p, { ...opt, method: "POST", data }),
  put: (p, data, opt = {}) => request(p, { ...opt, method: "PUT", data }),
  patch: (p, data, opt = {}) => request(p, { ...opt, method: "PATCH", data }),
  delete: (p, opt) => request(p, { ...opt, method: "DELETE" }),
};

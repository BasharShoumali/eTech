import { http } from "./http";

export const usersApi = {
  list: () => http.get("/users"),
  get: (id) => http.get(`/users/${id}`),
  create: (data) => http.post("/users", data),
  update: (id, data) => http.put(`/users/${id}`, data),
  remove: (id) => http.delete(`/users/${id}`),

  find: ({ username, email }) =>
    http.get("/users/find/user", { params: { username, email } }),
  login: ({ usernameOrEmail, password }) =>
    http.post("/users/login", { usernameOrEmail, password }),
  changeRole: (id, userRole) => http.patch(`/users/${id}/role`, { userRole }),
};

import { http } from "./http";

export const paymentsApi = {
  list: () => http.get("/payments"),
  get: (id) => http.get(`/payments/${id}`),
  create: (data) => http.post("/payments", data),
  update: (id, data) => http.put(`/payments/${id}`, data),
  remove: (id) => http.delete(`/payments/${id}`),

  byUser: (userNumber) => http.get(`/payments/user/${userNumber}`),
  defaultForUser: (userNumber) =>
    http.get(`/payments/user/${userNumber}/default`),
  setDefault: (id) => http.post(`/payments/${id}/default`),
};

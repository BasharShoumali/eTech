import { http } from "./http";

export const ordersApi = {
  list: () => http.get("/orders"),
  get: (id) => http.get(`/orders/${id}`),
  create: (data) => http.post("/orders", data),
  update: (id, data) => http.put(`/orders/${id}`, data),
  remove: (id) => http.delete(`/orders/${id}`),

  userOpen: (userNumber) => http.get(`/orders/user/${userNumber}/open`),
  userClosed: (userNumber) => http.get(`/orders/user/${userNumber}/closed`),

  placeOrder: (id) => http.post(`/orders/${id}/order`),
  cancel: (id) => http.post(`/orders/${id}/cancel`),
  deliver: (id) => http.post(`/orders/${id}/deliver`),
};

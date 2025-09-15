import { http } from "./http";

export const descriptionsApi = {
  list: () => http.get("/descriptions"),
  get: (id) => http.get(`/descriptions/${id}`),
  create: (data) => http.post("/descriptions", data),
  update: (id, data) => http.put(`/descriptions/${id}`, data),
  remove: (id) => http.delete(`/descriptions/${id}`),

  byProduct: (productNumber) =>
    http.get(`/descriptions/by-product/${productNumber}`),
  deleteByProduct: (productNumber) =>
    http.delete(`/descriptions/by-product/${productNumber}`),
};

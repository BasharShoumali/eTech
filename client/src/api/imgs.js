import { http } from "./http";

export const imgsApi = {
  list: () => http.get("/imgs"),
  get: (id) => http.get(`/imgs/${id}`),
  create: (data) => http.post("/imgs", data),
  update: (id, data) => http.put(`/imgs/${id}`, data),
  remove: (id) => http.delete(`/imgs/${id}`),

  byProduct: (productNumber) => http.get(`/imgs/by-product/${productNumber}`),
  deleteByProduct: (productNumber) =>
    http.delete(`/imgs/by-product/${productNumber}`),
};

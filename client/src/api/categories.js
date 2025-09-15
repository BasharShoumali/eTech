import { http } from "./http";

export const categoriesApi = {
  list: () => http.get("/categories"),
  get: (id) => http.get(`/categories/${id}`),
  create: (data) => http.post("/categories", data),
  updateName: (id, categoryName) =>
    http.patch(`/categories/${id}`, { categoryName }),
  remove: (id) => http.delete(`/categories/${id}`),
};

import { http } from "./http";

export const productsApi = {
  list: () => http.get("/products"),
  get: (id) => http.get(`/products/${id}`),
  create: (data) => http.post("/products", data),
  update: (id, data) => http.put(`/products/${id}`, data),
  remove: (id) => http.delete(`/products/${id}`),

  byBrand: (brand) => http.get(`/products/brand/${encodeURIComponent(brand)}`),
  byCategory: (categoryNumber) =>
    http.get(`/products/category/${categoryNumber}`),

  updateBarcode: (id, barcode) =>
    http.patch(`/products/${id}/barcode`, { barcode }),
  updatePrices: (id, { buyingPrice, sellingPrice }) =>
    http.patch(`/products/${id}/prices`, { buyingPrice, sellingPrice }),
  updateStock: (id, inStock) =>
    http.patch(`/products/${id}/stock`, { inStock }),
  decrementStock: (id) => http.post(`/products/${id}/stock/decrement`),
};

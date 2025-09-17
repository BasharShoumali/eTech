import { Router } from "express";
import users from "./users.routes.js";
import payments from "./paymentMethods.routes.js";
import orders from "./orders.routes.js";
import categories from "./categories.routes.js";
import imgs from "./imgs.routes.js";
import descriptions from "./descriptions.routes.js";
import productsRouter from "./products.routes.js";

const r = Router();
r.use("/users", users);
r.use("/payments", payments);
r.use("/orders", orders);
r.use("/categories", categories);
r.use("/products", productsRouter);
r.use("/product-images", imgs); // DELETE /api/product-images/:id ✅
r.use("/descriptions", descriptions);

export default r;

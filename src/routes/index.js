import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import custumerRoutes from "./custumer.routes.js";
import whiteListRoutes from "./whiteList.routes.js";
import contactRoutes from "./contact.routes.js";


const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/product", productRoutes);
routes.use("/custumer", custumerRoutes);
routes.use("/whitelist", whiteListRoutes);
routes.use("/contact", contactRoutes);

export default routes;

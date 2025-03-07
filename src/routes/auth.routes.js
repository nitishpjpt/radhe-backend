import { Router } from "express";
import {
  adminLogin,
  adminRegister,
} from "../controller/admin/auth.controller.js";
import { validator } from "../helper/validator.js";
import { authValidation, loginValidation } from "../validation/validation.js";


const routes = Router();

routes.post("/register", validator(authValidation), adminRegister);
routes.post("/login", validator(loginValidation), adminLogin);


export default routes;

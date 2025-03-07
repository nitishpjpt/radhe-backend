import { Router } from "express";
import {
  custumerLogin,
  custumerRegister,
  addToCart,
  mergeGuestCart,
  removeFromCart,
  getCartItems,
  updateCustomerProfile,
  updateCartItemQuantity,
} from "../controller/custumer/auth.costumer.js";
import { validator } from "../helper/validator.js";
import { authValidation, loginValidation } from "../validation/validation.js";
import {
  saveCustomerInfo,
  sendOrderSummary,
  clearCart,
} from "../nodemailer.js";
import{ createOrder, razorpay} from "../razorpayIntegration/razorpay.js";

const routes = Router();

routes.post("/register", validator(authValidation), custumerRegister);
routes.post("/login", validator(loginValidation), custumerLogin);
routes.post("/logout", custumerLogin);
routes.post("/cart/add", addToCart);
routes.post("/cart/merge", mergeGuestCart);
routes.delete("/cart/remove/:productId", removeFromCart);

routes.post("/save-customer-info", saveCustomerInfo);
routes.post("/send-order-summary", sendOrderSummary);
routes.post("/clear-cart", clearCart);

routes.post("/cart/all", getCartItems);
routes.put("/cart/update", updateCartItemQuantity);
routes.post("/update-custumer", updateCustomerProfile);

routes.post("/verify-payment" , razorpay);
routes.post("/create-order", createOrder)

export default routes;

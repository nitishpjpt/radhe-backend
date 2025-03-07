import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import custumerRoutes from './custumer.routes.js';
// import { nodemailer } from './nodemailer.routes.js';
// import  addToCart  from './cart.routes.js';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/product', productRoutes);
routes.use('/custumer', custumerRoutes);
// routes.use('/send-order-summary' , nodemailer)
// routes.use('/cart', addToCart);

export default routes;

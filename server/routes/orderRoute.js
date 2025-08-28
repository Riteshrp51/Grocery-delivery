import express from 'express';
import authUser from '../middleware/authUser.js';
import authSeller from '../middleware/authSeller.js';
import {getAllOrders, getOrdersByUserId, placeOrderCOD} from '../controllers/orderController.js'
const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getOrdersByUserId);
orderRouter.get('/seller', authSeller, getAllOrders);

export default orderRouter;
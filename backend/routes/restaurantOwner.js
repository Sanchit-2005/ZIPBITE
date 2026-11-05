import { Router } from "express";
const router = Router();
import authenticateUser from "../middleware/auth.js";
import {
  getRestaurantOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  monthlyRevenue,
} from "../controllers/restaurantOwnerController.js";

router
  .route("/restaurant-owner/orders")
  .get(authenticateUser, getRestaurantOrders);

router
  .route("/restaurant-owner/orders/monthly-revenue")
  .get(authenticateUser, monthlyRevenue);

router
  .route("/restaurant-owner/orders/:orderId/reject")
  .patch(authenticateUser, rejectOrder);

router
  .route("/restaurant-owner/orders/:orderId/accept")
  .patch(authenticateUser, acceptOrder);

router
  .route("/restaurant-owner/orders/:orderId/status")
  .patch(authenticateUser, updateOrderStatus);

export default router;

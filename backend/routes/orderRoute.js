import { Router } from "express";
import {
  addOrder,
  showMyOrders,
  showOrderById,
  cancelOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import authenticateUser from "../middleware/auth.js";
const router = Router();
router.route("/order").post(addOrder);
router.route("/order/my-orders").get(authenticateUser,showMyOrders);
router.route("/order/:orderId").get(showOrderById);
router.route("/order/:orderId/cancel").post(cancelOrderById);
router.route("/:orderId/status").patch(updateOrderStatus);

export default router;

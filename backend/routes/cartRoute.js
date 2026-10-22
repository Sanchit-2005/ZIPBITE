import {
  addItem,
  showCart,
  updateCart,
  deleteCart,
  removeItem,
} from "../controllers/cartController.js";
import authenticateUser from "../middleware/auth.js";
import { Router } from "express";
const router = Router();

router.route("/cart/items").post(authenticateUser, addItem);
router.route("/cart").get(authenticateUser, showCart);
router.route("/cart/items/:itemId").delete(authenticateUser, removeItem);
router.route("/cart/items/:itemId").patch(authenticateUser, updateCart);
router.route("/cart").delete(authenticateUser, deleteCart);

export default router;

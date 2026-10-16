import {
  addItem,
  showCart,
  updateCart,
  deleteCart,
} from "../controllers/cartController.js";
import { Router } from "express";
const router = Router();

router.route("/cart/items").post(addItem);
router.route("/cart").get(showCart);
router.route("/cart/items/:itemId").patch(updateCart);
router.route("/cart").delete(deleteCart);

export default router;

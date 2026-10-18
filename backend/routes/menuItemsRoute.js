import {
  addItem,
  getItems,
  oneItem,
  deleteItem,
  updateItem,
  getAllItems,
} from "../controllers/menuItemController.js";
import { Router } from "express";
import authenticateUser from "../middleware/auth.js";
const router = Router();
router.route("/menu-items").get(getAllItems);
router.route("/restaurants").post(authenticateUser, addItem);
router.route("/restaurants/:restaurantId").get(getItems);
router.route("/menu-item/:itemId").get(oneItem);
router.route("/menu-item/:itemId").delete(authenticateUser, deleteItem);
router.route("/menu-item/:itemId").patch(authenticateUser, updateItem);

export default router;

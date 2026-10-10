import {
  addItem,
  getItems,
  oneItem,
  deleteItem,
  updateItem,
} from "../controllers/menuItemController.js";
import { Router } from "express";
const router = Router();

router.route("/restaurants").post(addItem);
router.route("/restaurants/:restaurantId").get(getItems);
router.route("/menu-item/:itemId").get(oneItem);
router.route("/menu-item/:itemId").delete(deleteItem);
router.route("/menu-item/:itemId").patch(updateItem);


export default router;
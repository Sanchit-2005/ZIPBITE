import {
  getRestaurant,
  registerRestaurant,
  editRestaurant,
  deleteRestaurant,
  getNearbyRestaurant,
  showAllRestaurants,
} from "../controllers/restaurantController.js";
import { Router } from "express";
import multer from "multer";
import { storage } from "../cloudConfig.js";
const upload = multer({ storage });
const router = Router();

router.route("/").get(showAllRestaurants);
router.route("/nearby").get(getNearbyRestaurant);
router.route("/register").post(upload.single("image"), registerRestaurant);
router.route("/:restaurantId").get(getRestaurant);

router.route("/:restaurantId").put(editRestaurant);
router.route("/:restaurantId").delete(deleteRestaurant);

export default router;

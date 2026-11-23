import {
  getRestaurant,
  registerRestaurant,
  editRestaurant,
  deleteRestaurant,
  getNearbyRestaurant,
  showAllRestaurants,
} from "../controllers/restaurantController.js";
import cacheMiddleware from "../middleware/cacheMiddleware.js";
import { Router } from "express";
import multer from "multer";
import { storage } from "../cloudConfig.js";
const upload = multer({ storage });
const router = Router();
import authenticateUser from "../middleware/auth.js";
import authorizeRole from "../middleware/authorizeRole.js";

router.route("/").get(cacheMiddleware, showAllRestaurants);

router.route("/nearby").get(cacheMiddleware, getNearbyRestaurant);

// Public registration
router.route("/register").post(upload.single("image"), registerRestaurant);

// Public restaurant details
router.route("/:restaurantId").get(getRestaurant);

// Protected restaurant owner operations
router
  .route("/:restaurantId")
  .put(authenticateUser, authorizeRole("restaurant"), editRestaurant)
  .delete(authenticateUser, authorizeRole("restaurant"), deleteRestaurant);

export default router;

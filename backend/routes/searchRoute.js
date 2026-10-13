import { Router } from "express";
import { searchRestaurant, filters } from "../controllers/restaurantController.js";
const router = Router();
router.route("/search").get(searchRestaurant);
router.route("/search/filter").get(filters);
 export default router;
import { Router } from "express";
import { searchAll, filters } from "../controllers/restaurantController.js";
const router = Router();
router.route("/search").get(searchAll);
router.route("/search/filter").get(filters);
 export default router;
import { Router } from "express";
import { searchAll, filters } from "../controllers/restaurantController.js";
import cacheMiddleware from "../middleware/cacheMiddleware.js";
const router = Router();
router.route("/search").get(cacheMiddleware, searchAll);
router.route("/search/filter").get(cacheMiddleware, filters);
export default router;

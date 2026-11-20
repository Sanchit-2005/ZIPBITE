import { login, register } from "../controllers/customer.js";
import { Router } from "express";
import rateLimiter from "../middleware/rateLimiter.js";

const router = Router();

router.route("/login").post(rateLimiter(), login);
router.route("/register").post(rateLimiter(), register);

export default router;

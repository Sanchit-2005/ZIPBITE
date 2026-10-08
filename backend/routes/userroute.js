import { login, register } from "../controllers/customer.js";
import { Router } from "express";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);

export default router;

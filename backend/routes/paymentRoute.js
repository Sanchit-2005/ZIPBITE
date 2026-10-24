import { CreateOrder, VerifyOrder } from "../controllers/paymentController.js";
import authenticateUser from "../middleware/auth.js";
import { Router } from "express";
const router = Router();
router.route("/createOrder").post(CreateOrder);
router.route("/verifyPayment").post(VerifyOrder);

export default router;

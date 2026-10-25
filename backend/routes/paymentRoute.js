import { Router } from "express";
import { CreateOrder, VerifyOrder } from "../controllers/paymentController.js";
import authenticateUser from "../middleware/auth.js";

const router = Router();

router.post("/createOrder", authenticateUser, CreateOrder);
router.post("/verifyPayment", authenticateUser, VerifyOrder);

export default router;

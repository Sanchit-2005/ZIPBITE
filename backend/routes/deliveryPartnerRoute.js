import express from "express";
import { registerDeliveryPartner } from "../controllers/deliveryPartnerController.js";

const router = express.Router();

router.post("/register", registerDeliveryPartner);

export default router;
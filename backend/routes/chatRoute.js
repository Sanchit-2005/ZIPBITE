import { Router } from "express";
import {
  createConversation,
  customerConversation,
  ownerConversation,
} from "../controllers/conversationController.js";
import authenticateUser from "../middleware/auth.js";

const router = Router();

router.route("/conversation").post(authenticateUser, createConversation);
router.route("/user-conversation").get(authenticateUser, customerConversation);
router.route("/owner-conversation").get(authenticateUser, ownerConversation);

export default router;

import { Router } from "express";
import authenticateUser from "../middleware/auth.js";
import {
  createConversation,
  customerConversation,
  ownerConversation,
  getConversationMessages,
} from "../controllers/conversationController.js";

const router = Router();

router.post("/", authenticateUser, createConversation);
router.get("/user-conversation", authenticateUser, customerConversation);
router.get("/owner-conversation", authenticateUser, ownerConversation);
router.get("/:conversationId/messages", authenticateUser, getConversationMessages);

export default router;

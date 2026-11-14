import Conversation from "../models/Conversation.js";
import Message from "../models/message.js";
import { StatusCodes } from "http-status-codes";
import Restaurant from "../models/restaurant.js";

const createConversation = async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    let conversation = await Conversation.findOne({
      customer: customerId,
      restaurant: restaurantId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        customer: customerId,
        restaurant: restaurantId,
      });
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
};

const customerConversation = async (req, res) => {
  const customerId = req.user.id || req.user._id;

  const conversation = await Conversation.findOne({
    customer: customerId,
  }).populate("restaurant");

  if (!conversation) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "no conversation found" });
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Customer conversations fetched successfully",
    conversation,
  });
};

const ownerConversation = async (req, res) => {
  const ownerId = req.user.id || req.user._id;
  const restaurant = await Restaurant.findOne({ owner: ownerId });

  if (!restaurant) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "no owner found" });
  }

  const conversations = await Conversation.find({ restaurant: restaurant._id })
    .populate("customer", "name email")
    .sort({ lastMessageAt: -1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Conversations fetched successfully",
    conversations,
  });
};

const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = (
      req.user.id ||
      req.user._id ||
      req.user.customerId
    )?.toString();

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isCustomer = conversation.customer.toString() === userId;

    let isOwner = false;

    if (!isCustomer) {
      const restaurant = await Restaurant.findOne({
        _id: conversation.restaurant,
        owner: userId,
      });

      isOwner = Boolean(restaurant);
    }

    if (!isCustomer && !isOwner) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to access these messages",
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    return res.status(StatusCodes.OK).json({ success: true, messages });
  } catch (error) {
    console.error(error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

export {
  createConversation,
  customerConversation,
  ownerConversation,
  getConversationMessages,
};

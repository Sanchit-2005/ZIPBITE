import Conversation from "../models/Conversation.js";
import message from "../models/message.js";
import Message from "../models/message.js";
import { StatusCodes } from "http-status-codes";
import Restaurant from "../models/restaurant.js";

const createConversation = async (req, res) => {
  try {
    const customerId = req.user.id;
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

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
};

const customerConversation = async (req, res) => {
  const customerId = req.user.id;

  const conversation = await Conversation.findOne({
    customer: customerId,
  }).populate("restaurant");
  if (!conversation) {
    return res
      .send(StatusCodes.NOT_FOUND)
      .json({ message: "no conversation found" });
  }
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Customer conversations fetched successfully",
    conversation,
  });
};

const ownerConversation = async (req, res) => {
  const owner_Id = req.user.id;
  const restaurant = await Restaurant.findOne({
    owner: ownerId,
  });
  if (!restaurant) {
    return res.send(StatusCodes.NOT_FOUND).json({ messgae: "no owner found" });
  }
  const conversations = await Conversation.find({
    restaurant: restaurant._id,
  })
    .populate("customer")
    .sort({ lastMessageAt: -1 });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Conversations fetched successfully",
    conversations,
  });
};

export { createConversation, customerConversation ,ownerConversation};

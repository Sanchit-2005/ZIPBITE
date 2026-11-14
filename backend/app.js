import "./env.js";
import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userroute.js";
import restaurantRoute from "./routes/restaurantRoute.js";
import menuRoute from "./routes/menuItemsRoute.js";
import searchBox from "./routes/searchRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import payemntRoute from "./routes/paymentRoute.js";
import ownerRoute from "./routes/restaurantOwner.js";
import uploadRoute from "./routes/uploadRoute.js";
import chatRoute from "./routes/chatRoute.js";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import Conversation from "./models/Conversation.js";
import Restaurant from "./models/restaurant.js";
import Message from "./models/message.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization?.startsWith("Bearer ")
        ? socket.handshake.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = {
      ...decoded,
      id: decoded.customerId,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log("Authenticated user:", socket.user);

  socket.on("joinConversation", async ({ conversationId }, callback) => {
    try {
      const userId = socket.user.id;
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return callback({
          success: false,
          message: "Conversation not found",
        });
      }

      let isAuthorized = conversation.customer.toString() === userId;

      if (!isAuthorized) {
        const restaurant = await Restaurant.findOne({
          _id: conversation.restaurant,
          owner: userId,
        });

        isAuthorized = Boolean(restaurant);
      }

      if (!isAuthorized) {
        return callback({
          success: false,
          message: "You are not authorized to join this conversation",
        });
      }

      socket.join(conversationId.toString());

      return callback({
        success: true,
        message: "Joined conversation successfully",
      });
    } catch (error) {
      console.error(error);

      if (callback) {
        return callback({
          success: false,
          message: "Failed to join conversation",
        });
      }
    }
  });

  socket.on("sendMessage", async (data, callback) => {
    try {
      const { conversationId, message } = data;
      const senderId = socket.user.customerId;

      if (!message || !message.trim()) {
        return callback({
          success: false,
          message: "Message cannot be empty",
        });
      }

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return callback({
          success: false,
          message: "Conversation not found",
        });
      }

      const isCustomer = conversation.customer.toString() === senderId;

      let isOwner = false;

      if (!isCustomer) {
        const restaurant = await Restaurant.findOne({
          _id: conversation.restaurant,
          owner: senderId,
        });

        isOwner = Boolean(restaurant);
      }

      if (!isCustomer && !isOwner) {
        return callback({
          success: false,
          message: "Unauthorized",
        });
      }

      const newMessage = await Message.create({
        conversation: conversationId,
        sender: senderId,
        message: message.trim(),
      });

      conversation.lastMessage = message.trim();
      conversation.lastMessageAt = new Date();
      await conversation.save();

      io.to(conversationId.toString()).emit("receiveMessage", newMessage); //actual message send in room

      return callback({
        success: true,
        message: "Message sent successfully",
        data: newMessage,
      });
    } catch (error) {
      console.error(error);

      if (callback) {
        return callback({
          success: false,
          message: "Failed to send message",
        });
      }
    }
  });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("database is connected");
  })
  .catch((e) => {
    console.log("database is not connected");
    throw e;
  });

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/users", userRouter);
app.use("/restaurants", restaurantRoute);
app.use("/api", menuRoute);
app.use("/searchbox", searchBox);
app.use("/apiV1", cartRoute);
app.use("/apiV2", orderRoute);
app.use("/apiV3", payemntRoute);
app.use("/apiV4", ownerRoute);
app.use("/upload", uploadRoute);
app.use("/chat", chatRoute);

server.listen(process.env.PORT, () => {
  console.log(`app is listening on port ${process.env.PORT}`);
});

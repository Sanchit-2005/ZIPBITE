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

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
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

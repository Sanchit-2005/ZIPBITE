import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";
import userRouter from "./routes/userroute.js";
import restaurantRoute from "./routes/restaurantRoute.js";
import menuRoute from "./routes/menuItemsRoute.js";
import searchBox from "./routes/searchRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
const app = express();
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("database is connected");
  })

  .catch((e) => {
    console.log("database is not connected");
    throw e;
  });
app.use(express.json());

app.use("/users", userRouter);
app.use("/restaurants", restaurantRoute);
app.use("/api", menuRoute);
app.use("/searchbox", searchBox);
app.use("/apiV1", cartRoute);
app.use("/apiV2",orderRoute)

app.listen(process.env.PORT, () => {
  console.log(`app is listening on port ${process.env.PORT} `);
});

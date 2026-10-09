import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";
import userRouter from "./routes/userroute.js";
import restaurantRoute from "./routes/restaurantRoute.js";
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

app.listen(process.env.PORT, () => {
  console.log(`app is listening on port ${process.env.PORT} `);
});

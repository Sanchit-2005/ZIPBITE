import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await User.findById(decoded.id).select("-password");
    console.log(user);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid or expired token",
    });
  }
};

export default authenticateUser;

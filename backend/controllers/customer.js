import User from "../models/userModel.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const login = async (req, res) => {
  const { email, password } = req.body;
  const checkUser = await User.findOne({ email });
  if (!checkUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "User not found" });
  }
  const checkPass = await bcrypt.compare(password, checkUser.password);
  if (!checkPass) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid password" });
  }
  const token = jwt.sign(
    { customerId: checkUser._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  res.status(StatusCodes.OK).json({ token, message: "Welcome Back" });
};

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: "User already exists with this email" });
  }
  const hashPass = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    password: hashPass,
    email,
    phone,
  });
  await user.save();
  res
    .status(StatusCodes.CREATED)
    .json({ message: "User created successfully" });
};

export { login, register };

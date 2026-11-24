import User from "../models/userModel.js";
import DeliveryPartner from "../models/DeliveryPartner.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";

const registerDeliveryPartner = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      vehicleType,
      vehicleNumber,
      licenseNumber,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "delivery",
    });

    await user.save();

    try {
      const deliveryPartner = new DeliveryPartner({
        user: user._id,
        vehicleType,
        vehicleNumber,
        licenseNumber,
      });

      await deliveryPartner.save();

      return res.status(StatusCodes.CREATED).json({
        message: "Delivery partner registered successfully. Please log in.",
        deliveryPartner,
      });
    } catch (error) {
      // Remove user if profile creation fails
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  } catch (error) {
    console.error("Delivery registration error:", error.message);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Delivery partner registration failed",
    });
  }
};

export { registerDeliveryPartner };

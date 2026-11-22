import Restaurant from "../models/restaurant.js";
import Order from "../models/order.js";
import User from "../models/userModel.js";
import { StatusCodes } from "http-status-codes";
import asyncWrapper from "../asyncWrap.js";
import addEmailJob from "../queue/addEmailJob.js";

const sendOrderStatusEmail = async (order, status) => {
  try {
    let customer = order.customer;
    if (!customer || !customer.email) {
      customer = await User.findById(order.customer);
    }

    if (customer?.email) {
      const statusMessages = {
        CONFIRMED: "Great news! The restaurant has confirmed your order. 🎉",
        PREPARING: "Your delicious food is being freshly prepared! 👨‍🍳",
        READY_FOR_PICKUP: "Your order is ready for pickup! 🍱",
        OUT_FOR_DELIVERY: "Your order is on its way. Get ready! 🛵",
        DELIVERED: "Your order has been delivered. Enjoy your meal! ❤️",
        CANCELLED: "Your order has been cancelled by the restaurant.",
      };

      const formattedStatus = status.replaceAll("_", " ");

      await addEmailJob({
        to: customer.email,
        subject: `ZipBite - Your Order is ${formattedStatus}!`,
        message: `Hi ${customer.name || "Food Lover"}! 👋

${statusMessages[status] || `Your order status has been updated to ${formattedStatus}.`}

📦 ORDER UPDATE
Order ID: ${order._id}
Current Status: ${formattedStatus}
Total Amount: ₹${order.totalAmount}

Thank you for choosing ZipBite!

Best Regards,
Team ZipBite ❤️`,
      });

      console.log(`✅ Order status email (${status}) enqueued for:`, customer.email);
    }
  } catch (err) {
    console.error("❌ Failed to enqueue order status email:", err);
  }
};

const getRestaurantOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Restaurant not found",
      });
    }

    const query = {
      restaurant: restaurant._id,
    };

    if (status) {
      query.orderStatus = status.toUpperCase();
    }

    const orders = await Order.find(query)
      .populate("customer", "name email")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    return res.status(StatusCodes.OK).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message,
    });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Restaurant not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "PLACED") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Only placed orders can be accepted",
      });
    }

    order.orderStatus = "CONFIRMED";
    await order.save();

    await sendOrderStatusEmail(order, "CONFIRMED");

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message,
    });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Restaurant not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "PLACED") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Only placed orders can be rejected",
      });
    }

    order.orderStatus = "CANCELLED";
    order.cancelledAt = new Date();
    await order.save();

    await sendOrderStatusEmail(order, "CANCELLED");

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Order rejected successfully",
      order,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Restaurant not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Order not found",
      });
    }

    const allowedTransitions = {
      CONFIRMED: "PREPARING",
      PREPARING: "READY_FOR_PICKUP",
      READY_FOR_PICKUP: "OUT_FOR_DELIVERY",
      OUT_FOR_DELIVERY: "DELIVERED",
    };

    if (allowedTransitions[order.orderStatus] !== orderStatus) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid order status transition",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    await sendOrderStatusEmail(order, orderStatus);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message,
    });
  }
};

const monthlyRevenue = async (req, res) => {
  console.log("Fetching monthly revenue for restaurant owner:");
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const orders = await Order.find({
      restaurant: restaurant._id,
      paymentStatus: "PAID",
    }).sort({ createdAt: -1 });

    const monthlySales = Array(12).fill(0);

    for (const order of orders) {
      if (!order.createdAt) continue;
      const month = new Date(order.createdAt).getMonth();
      monthlySales[month] += Number(order.totalAmount) || 0;
    }

    return res.status(200).json({
      success: true,
      monthlySales,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: " Some Internal server error",
    });
  }
};

const restaurntOwnerInfo = asyncWrapper(async (req, res) => {
  const restaurant = await Restaurant.findOne({
    owner: req.user._id,
  }).populate("owner", "name email phone image role");

  if (!restaurant) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Restaurant not found" });
  }

  return res.status(StatusCodes.OK).json({
    message: "Restaurant details fetched successfully",
    restaurant,
  });
});

const updateOwnerProfile = asyncWrapper(async (req, res) => {
  const { name, email, phone, image } = req.body || {};
  const user = await User.findById(req.user._id);

  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Owner account not found" });
  }

  if (name !== undefined) {
    const nextName = String(name).trim();

    if (!nextName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Name is required" });
    }

    user.name = nextName;
  }

  if (email !== undefined) {
    const nextEmail = String(email).trim().toLowerCase();

    if (!nextEmail) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email is required" });
    }

    const escapedEmail = nextEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const emailInUse = await User.findOne({
      _id: { $ne: user._id },
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });

    if (emailInUse) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "That email is already in use" });
    }

    user.email = nextEmail;
  }

  if (phone !== undefined) {
    user.phone = String(phone).trim();
  }

  if (image !== undefined) {
    user.image = String(image).trim();
  }

  await user.save();

  return res.status(StatusCodes.OK).json({
    message: "Profile updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      role: user.role,
    },
  });
});

export {
  getRestaurantOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  monthlyRevenue,
  restaurntOwnerInfo,
  updateOwnerProfile,
};

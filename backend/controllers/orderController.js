import { StatusCodes } from "http-status-codes";
import asyncWrapper from "../asyncWrap.js";
import Order from "../models/order.js";
import Cart from "../models/cart.js";
import User from "../models/userModel.js";
import addEmailJob from "../queue/addEmailJob.js";
const allowedTransitions = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const addOrder = asyncWrapper(async (req, res) => {
  const {
    customerId,
    restaurantId,

    deliveryAddress,

    deliveryFee,
    paymentMethod,
    paymentStatus,
    orderStatus,

    tax,
  } = req.body;

  const effectiveCustomerId = req.user?.id || req.user?._id || customerId;

  if (!effectiveCustomerId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Customer ID is required" });
  }

  const cart = await Cart.findOne({ customer: effectiveCustomerId })
    .populate("items.menuItem")
    .populate("customer");

  if (!cart || cart.items.length === 0) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "cart  not found or cart is empty " });
  }

  if (cart.restaurant.toString() !== restaurantId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "cart restarant not match" });
  }

  const subtotal = cart.items.reduce((total, item) => {
    return total + item.quantity * item.menuItem.price;
  }, 0);

  const totalAmount = subtotal + Number(tax || 0) + Number(deliveryFee || 0);
  const order = await Order.create({
    customer: effectiveCustomerId,
    restaurant: restaurantId,
    items: cart.items.map((item) => ({
      menuItem: item.menuItem._id,
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.menuItem.price,
    })),
    deliveryAddress,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    paymentMethod,
    paymentStatus: "PENDING",
    orderStatus: "PLACED",
    orderedAt: Date.now(),
  });
  // 5. Clear the cart after order creation
  cart.items = [];
  await cart.save();
  console.log("1. Order created and cart cleared");

  // Retrieve customer details reliably
  let customer = cart.customer;
  if (!customer || !customer.email) {
    customer = await User.findById(effectiveCustomerId);
  }

  const customerEmail = customer?.email;
  const customerName = customer?.name || "Food Lover";

  console.log("2. Customer details:", customer);
  console.log("3. Customer email:", customerEmail);

  if (!customerEmail) {
    console.warn("⚠️ Customer email not found for ID:", effectiveCustomerId);
  } else {
    try {
      console.log("4. Adding email job to queue...");

      await addEmailJob({
        to: customerEmail,
        subject: "🎉 Your ZipBite Order is Confirmed!",
        message: `Hi ${customerName}!

Thank you for choosing ZipBite! ❤️

Your order has been successfully placed.

🍔 ZIPBITE - ORDER CONFIRMATION

📦 ORDER DETAILS
Order ID: ${order._id}
Order Status: ${order.orderStatus}
Payment Method: ${order.paymentMethod}

💰 PAYMENT SUMMARY
Subtotal: ₹${order.subtotal}
Delivery Fee: ₹${order.deliveryFee}
Tax: ₹${order.tax}
Total Amount: ₹${order.totalAmount}

Your restaurant will process your order shortly.

Thank you for being a part of ZipBite!

Best Regards,
Team ZipBite ❤️`,
      });

      console.log("5. Email job added successfully to queue!");
    } catch (emailError) {
      console.error("❌ Failed to enqueue email job:", emailError);
    }
  }

  // 6. Send response
  return res.status(StatusCodes.CREATED).json({
    message: "Order placed successfully!",
    order,
  });
});

const showMyOrders = asyncWrapper(async (req, res) => {
  const customerId = req.user.id;
  const orders = await Order.find({ customer: customerId })
    .populate("restaurant")
    .populate("items.menuItem")
    .sort({ createdAt: -1 });

  if (orders.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "No orders found for this customer",
    });
  }

  return res.status(StatusCodes.OK).json({
    message: "Orders fetched successfully",
    count: orders.length,
    orders,
  });
});

const showOrderById = async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "no order found" });
  }
  res.status(StatusCodes.OK).json(order);
};

const cancelOrderById = asyncWrapper(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "No order found" });
  }

  if (order.orderStatus === "CANCELLED") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Order is already cancelled" });
  }

  order.orderStatus = "CANCELLED";
  await order.save();

  return res.status(StatusCodes.OK).json({
    message: "Order cancelled successfully",
    order,
  });
});

const updateOrderStatus = asyncWrapper(async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  // Validate the requested status
  if (
    typeof orderStatus !== "string" ||
    !Object.hasOwn(allowedTransitions, orderStatus)
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid order status",
    });
  }

  // Find the order
  const order = await Order.findById(orderId).populate("customer");

  if (!order) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Order not found",
    });
  }

  // Check whether this status transition is allowed
  if (!allowedTransitions[order.orderStatus].includes(orderStatus)) {
    return res.status(StatusCodes.CONFLICT).json({
      message: `Cannot change status from ${order.orderStatus} to ${orderStatus}`,
    });
  }

  // Update status and relevant timestamps
  order.orderStatus = orderStatus;

  if (orderStatus === "DELIVERED") {
    order.deliveredAt = new Date();
  }

  if (orderStatus === "CANCELLED") {
    order.cancelledAt = new Date();
  }

  await order.save();
  const statusMessages = {
    CONFIRMED: "Great news! The restaurant has confirmed your order. 🎉",
    PREPARING: "Your delicious food is being freshly prepared! 👨‍🍳",
    READY_FOR_PICKUP: "Your order is ready for pickup! 🍱",
    OUT_FOR_DELIVERY: "Your order is on its way. Get ready! 🛵",
    DELIVERED: "Your order has been delivered. Enjoy your meal! ❤️",
    CANCELLED: "Your order has been cancelled. We hope to serve you again.",
  };

  try {
    let customer = order.customer;
    if (!customer || !customer.email) {
      customer = await User.findById(order.customer);
    }

    if (customer?.email) {
      const formattedStatus = orderStatus.replaceAll("_", " ");
      await addEmailJob({
        to: customer.email,
        subject: `ZipBite - Your Order is ${formattedStatus}!`,
        message: `Hi ${customer.name || "Food Lover"}! 👋

${statusMessages[orderStatus] || `Your order status has been updated to ${formattedStatus}.`}

📦 ORDER UPDATE

Order ID: ${order._id}
Current Status: ${formattedStatus}
Total Amount: ₹${order.totalAmount}

Thank you for choosing ZipBite!

Best Regards,
Team ZipBite ❤️`,
      });
      console.log(`✅ Order status email (${orderStatus}) enqueued for:`, customer.email);
    }
  } catch (emailErr) {
    console.error("❌ Failed to enqueue order status update email:", emailErr);
  }

  return res.status(StatusCodes.OK).json({
    message: "Order status updated successfully",
    order,
  });
});

const sendEmail = async (req, res) => {};

export {
  addOrder,
  showMyOrders,
  showOrderById,
  cancelOrderById,
  updateOrderStatus,
};

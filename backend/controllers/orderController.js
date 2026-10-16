import { StatusCodes } from "http-status-codes";
import asyncWrapper from "../asyncWrap.js";
import Order from "../models/order.js";
import Cart from "../models/cart.js";
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

  const cart = await Cart.findOne({ customer: customerId }).populate(
    "items.menuItem",
  );

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
    customer: customerId,
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
  });
  // 5. Clear the cart after order creation
  cart.items = [];
  await cart.save();

  // 6. Send response
  return res.status(StatusCodes.CREATED).json({
    message: "Order placed successfully!",
    order,
  });
});

const showMyOrders = asyncWrapper(async (req, res) => {
  const customerId = req.user._id;
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
  const order = await Order.findById(orderId);

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

  return res.status(StatusCodes.OK).json({
    message: "Order status updated successfully",
    order,
  });
});
export {
  addOrder,
  showMyOrders,
  showOrderById,
  cancelOrderById,
  updateOrderStatus,
};

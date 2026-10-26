import Restaurant from "../models/restaurant.js";
import Order from "../models/order.js";
import { StatusCodes } from "http-status-codes";

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

    order.orderStatus = "REJECTED";
    await order.save();

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

export { getRestaurantOrders, acceptOrder, rejectOrder, updateOrderStatus };

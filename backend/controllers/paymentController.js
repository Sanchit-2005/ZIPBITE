import Razorpay from "razorpay";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import Cart from "../models/cart.js";
import Order from "../models/order.js";
import dotenv from "dotenv";
dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.GATEWAY_API_KEY,
  key_secret: process.env.GATEWAY_API_SECRET,
});
3;

const CreateOrder = async (req, res) => {
  try {
    console.log("reached to createOrder");
    const customerId = req.user.id;
    const { deliveryAddress, instructions = "" } = req.body;

    if (!deliveryAddress) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Address is not provided" });
    }

    const cart = await Cart.findOne({
      customer: customerId,
    }).populate("items.menuItem");

    if (!cart || cart.items.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Cart is not found " });
    }
    const items = cart.items.map((item) => {
      if (!item.menuItem) {
        throw new Error("A menu item no longer exists");
      }

      return {
        menuItem: item.menuItem._id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        image: item.menuItem.image || "",
      };
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const deliveryFee = 0;
    const tax = 0;
    const discount = 0;

    const totalAmount = subtotal + deliveryFee + tax - discount;
    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    const order = await Order.create({
      customer: customerId,
      restaurant: cart.restaurant,
      items: items,
      deliveryAddress: deliveryAddress,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      tax: tax,
      discount: discount,
      totalAmount: totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      instructions: instructions,
    });
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${order._id}`,
    });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.GATEWAY_API_KEY,
    });
  } catch (err) {
    console.error("CreateOrder failed:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create payment order",
    });
  }
};

const VerifyOrder = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user.id,
      paymentMethod: "ONLINE",
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    if (order.razorpayOrderId != razorpay_order_id) {
      return res.status(StatusCodes.CONFLICT).json({ message: "Id not match" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.GATEWAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signaturesMatch =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature),
      );

    if (!signaturesMatch) {
      return res
        .json(StatusCodes.NOT_FOUND)
        .json({ message: "Verification Failed" });
    }
    // Confirm payment status with Razorpay before marking paid
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured or details do not match",
      });
    }

    order.paymentStatus = "PAID";
    order.paymentReference = razorpay_payment_id;
    await order.save();
    await Cart.findOneAndDelete({
      customer: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export { CreateOrder, VerifyOrder };

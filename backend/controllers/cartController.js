import Cart from "../models/cart.js";
import { StatusCodes } from "http-status-codes";
import asyncWrapper from "../asyncWrap.js";

const addItem = async (req, res) => {
  try {
    const { restaurantId, items } = req.body;
    const customerId = req.user.id;

    if (!customerId || !restaurantId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Customer and restaurant are required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Please add at least one item to the cart" });
    }

    let cart = await Cart.findOne({ customer: customerId });

    if (cart) {
      if (cart.restaurant && cart.restaurant.toString() !== restaurantId) {
        return res.status(StatusCodes.CONFLICT).json({
          message:
            "Your cart contains items from another restaurant. Clear your cart first.",
        });
      }

      cart.restaurant = restaurantId;

      for (const item of items) {
        //check karto item already exist karto ka cart mdhe
        const existingItem = cart.items.find(
          (cartItem) => cartItem.menuItem.toString() === item.menuItem,
        );

        if (existingItem) {
          //jr already exist karat asnar tr quantity +1 karnar
          existingItem.quantity += item.quantity;
        } else {
          cart.items.push(item);
        }
      }

      await cart.save();
    } else {
      //cart not exist previosly

      cart = await Cart.create({
        customer: customerId,
        restaurant: restaurantId,
        items,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Add item error:", error);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to add item to cart" });
  }
};

const showCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const cart = await Cart.findOne({ customer: customerId })
      .populate("items.menuItem")
      .populate("restaurant");
    if (!cart) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Cart not found" });
    }

    return res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "something went wrong" });
  }
};

const updateCart = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ "items.menuItem": itemId });
  if (!cart) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Not found cart" });
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== itemId, //jyanchi item id same nahi mhanje jo item  chi quantity 0 aahe te sodun bakiche thevayche aahet
    );

    await cart.save();
    return res
      .status(StatusCodes.OK)
      .json({ message: "Item removed from the cart" });
  }

  const item = cart.items.find((item) => item.menuItem.toString() === itemId);

  item.quantity = quantity;

  await cart.save();

  return res
    .status(StatusCodes.OK)
    .json({ message: "Updated the quantity of menuItem" });
};

const removeItem = asyncWrapper(async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Cart not found" });
    }

    const itemExists = cart.items.some(
      (item) => item.menuItem.toString() === itemId,
    );
    if (!itemExists) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Item not found in cart" });
    }

    // Remove the item
    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== itemId,
    );

    // Reset restaurant when cart becomes empty
    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();

    return res
      .status(StatusCodes.OK)
      .json({ message: "Item removed successfully", cart });
  } catch (error) {
    console.error("Remove item error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to remove item" });
  }
});

const deleteCart = asyncWrapper(async (req, res) => {
  const customerId = req.user.id;

  const cart = await Cart.findOne({ customer: customerId });

  if (!cart) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Cart not found!" });
  }

  await cart.deleteOne();

  return res.status(StatusCodes.OK).json({
    message: "Cart deleted successfully",
  });
});

export { addItem, showCart, updateCart, removeItem, deleteCart };

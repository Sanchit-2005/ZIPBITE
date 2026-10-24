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

    // Ensure we store the restaurant reference on the cart (if a new cart is created)
    // This will later be populated with the restaurant's name when we return the cart.

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

    // Populate the restaurant name before sending the response
    // Populate the restaurant name after saving the cart (Mongoose 6+)
    await cart.populate({ path: "restaurant", select: "name" });
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

// backend/controllers/cartController.js
const showCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    // 1️⃣ Populate items.menuItem and also the nested restaurant inside each menuItem
    // 2️⃣ Populate the top‑level restaurant and *only* request the name field (lighter payload)
    const cart = await Cart.findOne({ customer: customerId })
      .populate({
        path: "items.menuItem",
        populate: { path: "restaurant", select: "name" },
      })
      .populate({ path: "restaurant", select: "name" });

    console.log(cart.restaurant);

    if (!cart) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Cart not found" });
    }

    // If the cart was created without a restaurant (e.g. empty cart) but now has items,
    // copy the restaurant reference from the first item and persist it.
    if (!cart.restaurant && cart.items.length > 0) {
      const firstRestaurant = cart.items[0].menuItem?.restaurant;
      if (firstRestaurant) {
        cart.restaurant = firstRestaurant._id || firstRestaurant; // keep ObjectId
        console.log("restaurant name :", cart.restaurant);
        await cart.save();
        // Re‑populate after we saved the reference so the response includes the name
        await cart
          .populate({ path: "restaurant", select: "name" })
          .execPopulate();
      }
    }

    // Always send the restaurant object (even if null) – the front‑end logic will handle it.
    return res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    console.error("showCart error:", error);
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

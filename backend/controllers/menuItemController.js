import MenuItem from "../models/menuItem.js";
import { StatusCodes } from "http-status-codes";
const addItem = async (req, res) => {
  try {
    const {
      restaurant,
      name,
      description,
      price,
      category,
      preparationTime,
      image,
    } = req.body;

    // 1. Check whether the item already exists in this restaurant
    const checkItem = await MenuItem.findOne({
      restaurant,
      name: name.trim(),
    });

    if (checkItem) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "This food item already exists in this restaurant!",
      });
    }

    // 2. If it doesn't exist, create the item
    const menuItem = new MenuItem({
      restaurant,
      name: name.trim(),
      description,
      price,
      category,
      preparationTime,
      image,
    });

    // 3. Save the item
    await menuItem.save();

    return res.status(StatusCodes.CREATED).json({
      message: "New food item added successfully!",
      menuItem,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to add food item",
      error: err.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const items = await MenuItem.find({ restaurant: restaurantId });
    if (!items) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No items found for this restaurant." });
    }
    res.status(StatusCodes.OK).json(items);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const oneItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await MenuItem.findById(itemId).populate("restaurant");
    if (!item) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Item not found." });
    }
    res.status(StatusCodes.OK).json(item);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await MenuItem.findByIdAndDelete(itemId);
    if (!item) {
      res
        .status(StatusCodes.CONFLICT)
        .json({ message: "no item found to delete" });
    }
    res
      .status(StatusCodes.ACCEPTED)
      .json({ message: "item deleted successfully !" });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await MenuItem.findById(itemId);
    if (!item) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "no item found " });
    }
    const { name, description, price, category, preparationTime, image } =
      req.body;

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (category !== undefined) item.category = category;
    if (preparationTime !== undefined) item.preparationTime = preparationTime;
    if (image !== undefined) item.image = image;

    await item.save();
    res
      .status(StatusCodes.ACCEPTED)
      .json({ message: "Item updated successfully ", item });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message || "Failed to update item" });
  }
};
const getAllItems = async (req, res) => {
  try {
    const items = await MenuItem.find().populate("restaurant", "name image");

    return res.status(StatusCodes.OK).json(items);
  } catch (err) {
    console.error(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch all items." });
  }
};

const manageItemAvaibility = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isAvailable } = req.body;
    const item = await MenuItem.findByIdAndUpdate(
      itemId,
      { isAvailable },
      { new: true, runValidators: true },
    );
    if (!item) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }
    res.status(200).json({
      message: "Availability updated successfully",
      item,
    });
  } catch (err) {
    console.log(err);
  }
};

export { addItem, getItems, oneItem, deleteItem, updateItem, getAllItems,manageItemAvaibility };

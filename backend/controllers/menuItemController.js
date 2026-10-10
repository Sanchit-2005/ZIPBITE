import MenuItem from "../models/menuItem.js";
import { StatusCodes } from "http-status-codes";
const addItem = async (req, res) => {
  try {
    const { restaurant, name, description, price, category, preparationTime } =
      req.body;

      const checkItem=MenuItem.findOne({restaurant,name});
      if(checkItem){
        return  res.status(StatusCodes.NOT_ACCEPTABLE).json({message:"Item already exists !"});
      }

    const menuItem = new MenuItem({
      restaurant,
      name,
      description,
      price,
      category,
      preparationTime,
    });
    await menuItem.save();
    res.status(StatusCodes.CREATED).json({ message: "new Item added  !" });
  } catch (err) {
    throw err;
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
    const item = await MenuItem.findById(itemId);
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

    const item = await MenuItem.findByIdAndDelete( itemId );
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
    const { name, description, price, category, preparationTime } = req.body;

    item.name = name || item.name;
    item.description = description || item.description;
    item.price = price || item.price;
    item.category = category || item.category;
    item.preparationTime = preparationTime || item.preparationTime;
    item.save();
    res
      .status(StatusCodes.ACCEPTED)
      .json({ message: "Item updated successfully " });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export { addItem, getItems, oneItem, deleteItem, updateItem };
